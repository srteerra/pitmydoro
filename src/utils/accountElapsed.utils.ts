import { usePomodoroStore } from '@/stores/Pomodoro.store';
import { useTaskStore } from '@/stores/Tasks.store';
import { SessionStatusEnum } from '@/enums/SessionStatus.enum';
import { taskService } from '@/services/task.service';
import { Task, TaskStatsDelta } from '@/interfaces/Task.interface';

export const flushElapsedTime = async (userId?: string | null) => {
  const { currentPomodoro: pomo, accountedAt, setAccountedAt } = usePomodoroStore.getState();

  if (!pomo?.task || accountedAt == null) return;

  const now = Date.now();
  const elapsedMs = now - accountedAt;
  setAccountedAt(now);

  if (elapsedMs <= 0) return;

  const taskId = pomo.task.id;

  const apply = async (delta: TaskStatsDelta) => {
    useTaskStore.getState().applyTaskStats(taskId, delta);
    if (userId) await taskService.updateTaskStats(userId, taskId, delta);
  };

  if (pomo.status === 'paused') {
    if (pomo.type === SessionStatusEnum.IN_SESSION) {
      await apply({ pausedTime: elapsedMs });
    }
    return;
  }

  const elapsedMinutes = elapsedMs / 60_000;

  if (pomo.type === SessionStatusEnum.IN_SESSION) {
    await apply({ workTime: elapsedMinutes });
  } else {
    await apply({ breakTime: elapsedMinutes });
  }
};

export const rebindRunningPomodoroTask = async (newTask: Task | null, userId?: string | null) => {
  const { currentPomodoro: pomo, setCurrentPomodoro, setAccountedAt } = usePomodoroStore.getState();

  if (!pomo?.task || !newTask || pomo.task.id === newTask.id) return;

  await flushElapsedTime(userId);
  setCurrentPomodoro({ ...pomo, task: newTask });
  setAccountedAt(Date.now());
};
