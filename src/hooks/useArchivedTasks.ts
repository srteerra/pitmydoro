import { useEffect, useMemo, useState } from 'react';
import { Task } from '@/interfaces/Task.interface';
import { useTaskStore } from '@/stores/Tasks.store';
import { taskService } from '@/services/task.service';
import { useAuth } from '@/contexts/AuthContext';
import { ARCHIVED_TASKS_LIMIT } from '@/constants/Tasks';
import { mergeArchivedTasks } from '@/utils/taskView.utils';

export function useArchivedTasks(enabled: boolean) {
  const { user } = useAuth();
  const localTasks = useTaskStore((state) => state.tasks);
  const [remoteTasks, setRemoteTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !user) return;

    let cancelled = false;
    setLoading(true);

    taskService
      .getArchivedTasks(user.uid, ARCHIVED_TASKS_LIMIT)
      .then((tasks) => !cancelled && setRemoteTasks(tasks))
      .catch((error) => console.error('Failed to load archived tasks:', error))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [enabled, user]);

  const archivedTasks = useMemo(
    () => (enabled ? mergeArchivedTasks(remoteTasks, localTasks) : []),
    [enabled, remoteTasks, localTasks]
  );

  return { archivedTasks, loading };
}
