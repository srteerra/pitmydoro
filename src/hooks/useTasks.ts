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

    addTask({ ...taskData, isSync: !!user });
  };

  const update = async (id: string, updates: Partial<Task>) => {
    if (user) {
      await taskService.update(user.uid, id, updates);
    }

    updateTask(id, updates);
  };

  const remove = async (id: string) => {
    if (user) {
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
    };

    await create(newTask);
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

    await update(taskId, {
      title: title ?? currentTaskEditing.title,
      description: description ?? currentTaskEditing.description,
      estimatedPomodoros: numberOfPomodoros ?? currentTaskEditing.estimatedPomodoros,
      totalPomodoros: taskCompletedPomodoros ?? currentTaskEditing.totalPomodoros,
    });
  };

  const reorderTasks = async (orderedTasks: Task[]) => {
    const tasksWithNewOrder = orderedTasks.map((task, index) => ({
      ...task,
      order: index + 1,
    }));

    setTasks(tasksWithNewOrder);

    const updatePromises = orderedTasks.map((task, index) => {
      const newOrder = index + 1;
      if (task.order !== newOrder) {
        return user
          ? taskService.update(user.uid, task.id, { order: newOrder })
          : updateTask(task.id, { order: newOrder });
      }
      return Promise.resolve();
    });

    await Promise.all(updatePromises);
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
    setTasks(remoteTasks);
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
    loadTasks,
    wipeTasks,
    handleAddTask,
    handleReorderTasks,
    handleEditTask,
    selectTask,
    unselectTask,
  };
}
