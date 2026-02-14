import { useEffect, useMemo } from 'react';
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
    setLoading,
    setCurrentTask,
    clearCurrentTask,
  } = useTaskStore();

  const incompleteTasks = useMemo(() => {
    return _.chain(tasks).reject('completedAt').sortBy('order').value();
  }, [tasks]);

  useEffect(() => {
    if (user) {
      setLoading(true);

      const localTasks = taskService.local.load();
      if (localTasks.length > 0) {
        syncLocalTasks();
      }

      const unsubscribe = taskService.subscribe(user.uid, (tasks) => {
        setTasks(tasks);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      const localTasks = taskService.local.load();
      setTasks(localTasks);
    }
  }, [user]);

  const syncLocalTasks = async () => {
    if (!user) return;

    const localTasks = taskService.local.load();
    for (const task of localTasks) {
      await taskService.create(task, user.uid);
    }
    taskService.local.clear();
  };

  const create = async (taskData: Task) => {
    if (user) {
      await taskService.create(taskData, user.uid);
    } else {
      const newTask = taskService.local.add(taskData);
      addTask(newTask);
    }
  };

  const update = async (id: string, updates: Partial<Task>) => {
    if (user) {
      await taskService.update(user.uid, id, updates);
    } else {
      taskService.local.update(id, updates);
      updateTask(id, updates);
    }
  };

  const remove = async (id: string) => {
    if (user) {
      await taskService.delete(user.uid, id);
    } else {
      taskService.local.delete(id);
      removeTask(id);
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
    if (user) {
      await taskService.complete(user.uid, id, isComplete);
    } else {
      const updates = { completedAt: isComplete ? Timestamp.now() : null };
      taskService.local.update(id, updates);
      updateTask(id, updates);
    }
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
          : taskService.local.update(task.id, { order: newOrder });
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

  return {
    tasks,
    currentTask,
    loading,
    incompleteTasks,
    createTask: create,
    updateTask: update,
    deleteTask: remove,
    checkTask: check,
    handleAddTask,
    handleReorderTasks,
    handleEditTask,
    selectTask,
    unselectTask,
  };
}
