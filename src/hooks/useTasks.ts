import { useMemo } from 'react';
import { EditTask, Task } from '@/interfaces/Task.interface';
import { useTaskStore } from '@/stores/Tasks.store';
import { useAuth } from '@/contexts/AuthContext';
import { taskService } from '@/services/task.service';
import { Timestamp } from 'firebase/firestore';
import _ from 'lodash';

export function useTasks() {
  const { user } = useAuth();
  const {
    tasks,
    currentTask,
    setEditingTask,
    resetAll,
    loading,
    setTasks,
    addTask,
    updateTask,
    removeTask,
    setCurrentTask,
    clearCurrentTask,
  } = useTaskStore();

  const incompleteTasks = useMemo(() => {
    return _.chain(tasks).reject('completedAt').sortBy('order').value();
  }, [tasks]);

  const create = async (taskData: Task) => {
    if (user) {
      await taskService.create(taskData, user.uid);
    }

    updateTask(taskData.id, { ...taskData, isSync: !!user });
  };

  const update = async (id: string, updates: Partial<Task>) => {
    const task = tasks.find((t) => t.id === id);

    if (user && task?.isSync) {
      await taskService.update(user.uid, id, updates);
    }

    updateTask(id, updates);
  };

  const remove = async (id: string) => {
    const task = tasks.find((t) => t.id === id);

    if (user && task?.isSync) {
      await taskService.delete(user.uid, id);
    }

    removeTask(id);

    const remainingTasks = _.sortBy(tasks, 'order').filter((t) => t.id !== id);
    await reorderTasks(remainingTasks);

    if (currentTask?.id === id) {
      const nextTask = _.chain(remainingTasks)
        .reject('completedAt')
        .sortBy('order')
        .first()
        .value();

      setCurrentTask(nextTask || null);
    }
  };

  const check = async (id: string, isComplete?: boolean) => {
    if (user) {
      await taskService.complete(user.uid, id, isComplete);
    }

    const updates = { completedAt: isComplete ? Timestamp.now() : null };
    updateTask(id, updates);
  };

  const selectTask = (task: Task) => {
    setCurrentTask(task);
  };

  const unselectTask = () => {
    clearCurrentTask();
  };

  const handleAddTask = async (taskId?: string) => {
    const id = taskId || crypto.randomUUID();
    setEditingTask(id);

    const newTask: Task = {
      id,
      title: '',
      description: '',
      order: tasks.length + 1,
      estimatedPomodoros: 1,
      totalPomodoros: 0,
      isSync: false,
    };

    addTask({ ...newTask, isSync: false });
    if (!currentTask) setCurrentTask(newTask);
  };

  const handleEditTask = async (taskId: string, data: EditTask) => {
    const { title, description, taskCompletedPomodoros, numberOfPomodoros } = data;
    const currentTaskEditing = tasks.find((task) => task.id === taskId);

    if (!currentTaskEditing) return;

    if (!title) {
      await remove(taskId);
      return;
    }

    if (!currentTaskEditing.isSync) {
      const newTask: Task = {
        ...currentTaskEditing,
        title,
        description: description ?? '',
        estimatedPomodoros: numberOfPomodoros ?? currentTaskEditing.estimatedPomodoros,
        totalPomodoros: taskCompletedPomodoros ?? currentTaskEditing.totalPomodoros,
      };

      await create(newTask);
    } else {
      await update(taskId, {
        title,
        description: description ?? currentTaskEditing.description,
        estimatedPomodoros: numberOfPomodoros ?? currentTaskEditing.estimatedPomodoros,
        totalPomodoros: taskCompletedPomodoros ?? currentTaskEditing.totalPomodoros,
      });
    }
  };

  const reorderTasks = async (orderedTasks: Task[]) => {
    const tasksWithNewOrder = orderedTasks.map((task, index) => ({
      ...task,
      order: index + 1,
    }));

    setTasks(tasksWithNewOrder);

    if (user) {
      const activeOrderIds = orderedTasks.map((t) => t.id);
      await taskService.saveActiveTasksOrder(user.uid, activeOrderIds);
    }
  };

  const handleReorderTasks = async (newOrderedTasks: Task[]) => {
    await reorderTasks(newOrderedTasks);

    if (!currentTask && incompleteTasks.length > 0) {
      setCurrentTask(incompleteTasks[0]);
    }
  };

  const loadTasks = async (userId: string) => {
    await taskService.syncTasks(userId);
    const remoteTasks = await taskService.getTasks(userId);

    const existingTasksMap = new Map(tasks.map((t) => [t.id, t.order]));

    const tasksWithOrder = remoteTasks.map((task) => ({
      ...task,
      order: existingTasksMap.get(task.id) ?? task.order,
    }));

    const sortedTasks = _.sortBy(tasksWithOrder, 'order').map((task, index) => ({
      ...task,
      order: index + 1,
    }));

    setTasks(sortedTasks);
  };

  const resetAllTasks = async () => {
    resetAll();
    if (!user) return;
    await taskService.resetAllTasks(user.uid);
  };

  const wipeTasks = async () => {
    setTasks(tasks.filter((task) => !task.isSync));
  };

  return {
    tasks,
    currentTask,
    loading,
    incompleteTasks,
    createTask: create,
    updateTask: update,
    deleteTask: remove,
    checkTask: check,
    resetAllTasks,
    loadTasks,
    wipeTasks,
    handleAddTask,
    handleReorderTasks,
    handleEditTask,
    selectTask,
    unselectTask,
  };
}
