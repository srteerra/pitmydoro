import { usePomodoroStore } from '@/stores/Pomodoro.store';
import { useTaskStore } from '@/stores/Tasks.store';
import { SessionStatusEnum } from '@/enums/SessionStatus.enum';
import { taskService } from '@/services/task.service';
import { Task, TaskStatsDelta } from '@/interfaces/Task.interface';

const MIN_CHECKPOINT_INTERVAL_MS = 60_000;

interface FlushOptions {
  minElapsedMs?: number;
}

export const flushElapsedTime = async (userId?: string | null, options: FlushOptions = {}) => {
  const { currentPomodoro: pomo, accountedAt, setAccountedAt } = usePomodoroStore.getState();

  if (!pomo?.task || accountedAt == null) return;

  const now = Date.now();
  const elapsedMs = now - accountedAt;

  if (elapsedMs <= 0) return;
  if (elapsedMs < (options.minElapsedMs ?? 0)) return;

  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  if (elapsedSeconds <= 0) return;

  setAccountedAt(now - (elapsedMs % 1000));

  const taskId = pomo.task.id;

  const apply = async (delta: TaskStatsDelta) => {
    useTaskStore.getState().applyTaskStats(taskId, delta);
    if (userId) await taskService.updateTaskStats(userId, taskId, delta);
  };

  if (pomo.status === 'paused') {
    if (pomo.type === SessionStatusEnum.IN_SESSION) {
      await apply({ pausedTime: elapsedSeconds });
    }
    return;
  }

  if (pomo.type === SessionStatusEnum.IN_SESSION) {
    await apply({ workTime: elapsedSeconds });
  } else {
    await apply({ breakTime: elapsedSeconds });
  }
};

export const flushElapsedCheckpoint = (userId?: string | null) =>
  flushElapsedTime(userId, { minElapsedMs: MIN_CHECKPOINT_INTERVAL_MS });

export const rebindRunningPomodoroTask = async (newTask: Task | null, userId?: string | null) => {
  const { currentPomodoro: pomo, setCurrentPomodoro, setAccountedAt } = usePomodoroStore.getState();

  if (!pomo?.task || !newTask || pomo.task.id === newTask.id) return;

  await flushElapsedTime(userId);
  setCurrentPomodoro({ ...pomo, task: newTask });
  setAccountedAt(Date.now());
};
