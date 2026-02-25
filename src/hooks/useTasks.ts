import { useMemo } from 'react';
import { EditTask, Task } from '@/interfaces/Task.interface';
import { useTaskStore } from '@/stores/Tasks.store';
import { useAuth } from '@/contexts/AuthContext';
import { taskService } from '@/services/task.service';
import { Timestamp } from 'firebase/firestore';
import _ from 'lodash';
import useSettingsStore from '@/stores/Settings.store';

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
    previousCurrentTask,
    previousTasks,
    setPreviousCurrentTask,
    setPreviousTasks
  } = useTaskStore();

  const autoOrderTasks = useSettingsStore((state) => state.autoOrderTasks);
  const autoStartNextTask = useSettingsStore((state) => state.autoStartNextTask);

  const incompleteTasks = useMemo(() => {
    return _.chain(tasks).reject('completedAt').sortBy('order').value();
  }, [tasks]);

  const create = async (taskData: Task) => {
    updateTask(taskData.id, { ...taskData, isSync: !!user });

    if (user) {
      await taskService.create(taskData, user.uid);
    }
  };

  const update = async (id: string, updates: Partial<Task>) => {
    updateTask(id, updates);

    const task = tasks.find((t) => t.id === id);

    if (user && task?.isSync) {
      await taskService.update(user.uid, id, updates);
    }
  };

  const remove = async (id: string) => {
    removeTask(id);

    const task = tasks.find((t) => t.id === id);

    if (user && task?.isSync) {
      await taskService.delete(user.uid, id);
    }

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
    const updates = { completedAt: isComplete ? Timestamp.now() : null };
    updateTask(id, updates);

    const freshTasks = useTaskStore.getState().tasks;

    const freshIncompleteTasks = _.chain(freshTasks)
      .filter((t) => !t.completedAt)
      .sortBy('order')
      .value();

    const freshCompletedTasks = _.chain(freshTasks)
      .filter((t) => !!t.completedAt)
      .sortBy('completedAt')
      .value();

    if (isComplete && autoStartNextTask && freshIncompleteTasks.length > 0) {
      setCurrentTask(freshIncompleteTasks[0]);
    }

    if (autoOrderTasks) {
      const orderedTasks = [...freshIncompleteTasks, ...freshCompletedTasks];
      await handleReorderTasks(orderedTasks);
    }

    if (user) {
      await taskService.complete(user.uid, id, isComplete);
    }
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
    if (!currentTask && incompleteTasks.length > 0) {
      setCurrentTask(incompleteTasks[0]);
    }

    await reorderTasks(newOrderedTasks);
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
    if (sortedTasks?.length > 0) setCurrentTask(sortedTasks[0]);
  };

  const resetAllTasks = async () => {
    setPreviousTasks(tasks);
    setPreviousCurrentTask(currentTask);

    resetAll();
    if (!user) return;
    await taskService.resetAllTasks(user.uid);
  };

  const undoResetAllTasks = async () => {
    if (!previousTasks) return;

    setTasks(previousTasks);
    setCurrentTask(previousCurrentTask);

    if (!user) return;

    for (const task of previousTasks) {
      if (task.isSync) {
        await taskService.create(task, user.uid);
      }
    }
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
    undoResetAllTasks,
    loadTasks,
    wipeTasks,
    handleAddTask,
    handleReorderTasks,
    handleEditTask,
    unselectTask,
  };
}
