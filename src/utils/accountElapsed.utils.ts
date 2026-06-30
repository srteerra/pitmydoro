import { usePomodoroStore } from '@/stores/Pomodoro.store';
import { useTaskStore } from '@/stores/Tasks.store';
import { SessionStatusEnum } from '@/enums/SessionStatus.enum';
import { taskService } from '@/services/task.service';
import { Task, TaskStatsDelta } from '@/interfaces/Task.interface';
import { Pomodoro } from '@/interfaces/Pomodoro.interface';
import { creditPomodoroPause, creditPomodoroWork } from '@/utils/pomodoroEntry.utils';

const MIN_CHECKPOINT_INTERVAL_MS = 60_000;

type Bucket = 'work' | 'paused' | 'break';

interface FlushOptions {
  minElapsedMs?: number;
}

const bucketFor = (pomo: Pomodoro): Bucket => {
  if (pomo.status === 'paused') return 'paused';
  return pomo.type === SessionStatusEnum.IN_SESSION ? 'work' : 'break';
};

export const flushElapsedTime = async (userId?: string | null, options: FlushOptions = {}) => {
  const {
    currentPomodoro: pomo,
    accountedAt,
    carryMs,
    setAccountedAt,
    setCarryMs,
  } = usePomodoroStore.getState();

  if (!pomo?.task || accountedAt == null) return;

  const now = Date.now();
  const elapsedMs = now - accountedAt;

  if (elapsedMs <= 0) return;
  if (elapsedMs < (options.minElapsedMs ?? 0)) return;

  const bucket = bucketFor(pomo);
  const totalMs = elapsedMs + (carryMs[bucket] ?? 0);
  const elapsedSeconds = Math.floor(totalMs / 1000);

  // Advance the baseline to now and keep the sub-second leftover in this bucket's
  // carry, so it rolls into a future whole second instead of being discarded on
  // pause/resume transitions.
  setAccountedAt(now);
  setCarryMs({ ...carryMs, [bucket]: totalMs - elapsedSeconds * 1000 });

  if (elapsedSeconds <= 0) return;

  const taskId = pomo.task.id;

  const apply = async (delta: TaskStatsDelta) => {
    useTaskStore.getState().applyTaskStats(taskId, delta);
    if (userId) await taskService.updateTaskStats(userId, taskId, delta);
  };

  if (bucket === 'paused') {
    if (pomo.type === SessionStatusEnum.IN_SESSION) {
      creditPomodoroPause(elapsedSeconds);
      await apply({ pausedTime: elapsedSeconds });
    }
    return;
  }

  if (bucket === 'work') {
    creditPomodoroWork(elapsedSeconds);
    await apply({ workTime: elapsedSeconds });
  } else {
    await apply({ breakTime: elapsedSeconds });
  }
};

export const flushElapsedCheckpoint = (userId?: string | null) =>
  flushElapsedTime(userId, { minElapsedMs: MIN_CHECKPOINT_INTERVAL_MS });

export const rebindRunningPomodoroTask = async (newTask: Task | null, userId?: string | null) => {
  const {
    currentPomodoro: pomo,
    setCurrentPomodoro,
    setAccountedAt,
    resetCarryMs,
  } = usePomodoroStore.getState();

  if (!pomo?.task || !newTask || pomo.task.id === newTask.id) return;

  await flushElapsedTime(userId);
  setCurrentPomodoro({ ...pomo, task: newTask });
  setAccountedAt(Date.now());
  resetCarryMs();
};
