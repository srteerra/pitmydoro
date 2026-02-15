import { useEffect, useMemo } from 'react';
import { Team } from '@/interfaces/Teams.interface';
import { Task } from '@/interfaces/Task.interface';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useTaskStore } from '@/stores/Tasks.store';
import { taskService } from '@/services/task.service';
import useSettingsStore from '@/stores/Settings.store';
import _ from 'lodash';
import { SessionStatusEnum } from '@/enums/SessionStatus.enum';
import { useTasks } from '@/hooks/useTasks';
import { usePomodoroStore } from '@/stores/Pomodoro.store';

export const usePomodoro = () => {
  const { user } = useAuth();
  const { checkTask } = useTasks();
  const { currentPomodoro, setCurrentPomodoro } = usePomodoroStore();
  const { currentTask, tasks, setCurrentTask, updateTask } = useTaskStore();
  const autoStartNextTask = useSettingsStore((state) => state.autoStartNextTask);

  const incompleteTasks = useMemo(() => {
    return _.chain(tasks).reject('completedAt').sortBy('order').value();
  }, [tasks]);

  const calculatePausedTime = (pauses?: { pausedAt: Timestamp; resumedAt: Timestamp }[]) => {
    if (!pauses || pauses.length === 0) return 0;

    return pauses.reduce((total, pause) => {
      const pausedMs = pause.pausedAt.toMillis();
      const resumedMs = pause.resumedAt.toMillis();
      const diff = (resumedMs - pausedMs) / 1000 / 60;
      return total + diff;
    }, 0);
  };

  const start = async (type: SessionStatusEnum, duration: number, team: Team, task?: Task) => {
    const taskToUse = task || currentTask || null;

    setCurrentPomodoro({
      type,
      duration,
      startAt: Timestamp.now(),
      startTeam: team,
      task: taskToUse,
      status: 'running',
    });
  };

  const pause = async () => {
    if (!currentPomodoro || !currentPomodoro.task || !user) return;

    const pausedAt = Timestamp.now();

    await taskService.addPauseToTask(user.uid, currentPomodoro.task.id, {
      pausedAt,
      resumedAt: null,
    });

    setCurrentPomodoro({
      ...currentPomodoro,
      status: 'paused',
      currentPauseStart: pausedAt,
    });
  };

  const resume = async () => {
    if (!currentPomodoro || !currentPomodoro.task || !user) return;

    const resumedAt = Timestamp.now();

    await taskService.updateLastPause(user.uid, currentPomodoro.task.id, resumedAt);

    if (currentPomodoro.currentPauseStart) {
      const pausedMs = currentPomodoro.currentPauseStart.toMillis();
      const resumedMs = resumedAt.toMillis();
      const pausedMinutes = (resumedMs - pausedMs) / 1000 / 60;

      await taskService.updateTaskStats(user.uid, currentPomodoro.task.id, {
        pausedTime: pausedMinutes,
        pauses: 1,
      });
    }

    setCurrentPomodoro({
      ...currentPomodoro,
      status: 'running',
      currentPauseStart: undefined,
    });
  };

  const complete = async () => {
    if (!currentPomodoro || !user) return;

    if (currentPomodoro.type === 'session' && currentPomodoro.task) {
      const task = currentPomodoro.task;

      const pausedTime = calculatePausedTime(task.pauses);
      console.log('pausedTime', pausedTime);
      console.log('currentPomodoro.duration', currentPomodoro.duration);
      const workTime = currentPomodoro.duration - pausedTime;

      console.log('workTime', workTime);
      await taskService.updateTaskStats(user.uid, task.id, {
        workTime: workTime > 0 ? workTime : currentPomodoro.duration,
        pomodoros: 1,
      });

      if (!task.completedAt)
        await checkTask(task.id, task.estimatedPomodoros === task.totalPomodoros + 1);

      updateTask(task.id, { totalPomodoros: task.totalPomodoros + 1 });
      await taskService.update(user.uid, task.id, { pauses: [] });
    }

    if (
      (currentPomodoro.type === 'shortBreak' || currentPomodoro.type === 'longBreak') &&
      currentPomodoro.task
    ) {
      await taskService.updateTaskStats(user.uid, currentPomodoro.task.id, {
        breakTime: currentPomodoro.duration,
      });
    }

    setCurrentPomodoro(null);
  };

  const interrupt = async () => {
    if (!currentPomodoro || !user) return;

    if (currentPomodoro.task) {
      await taskService.updateTaskStats(user.uid, currentPomodoro.task.id, {
        interruptions: 1,
      });

      await taskService.update(user.uid, currentPomodoro.task.id, { pauses: [] });
    }

    setCurrentPomodoro(null);
  };

  const switchTask = async (newTask: Task) => {
    if (currentPomodoro && user) {
      await interrupt();
    }

    setCurrentTask(newTask);
  };

  useEffect(() => {
    if (!tasks?.length) setCurrentTask(null);
  }, [tasks, setCurrentTask]);

  useEffect(() => {
    if (!autoStartNextTask) return;

    if (!currentTask && incompleteTasks.length > 0) {
      setCurrentTask(incompleteTasks[0]);
    }
  }, [tasks, currentTask, autoStartNextTask, setCurrentTask, incompleteTasks]);

  return {
    currentPomodoro,
    currentTask,
    start,
    pause,
    resume,
    complete,
    interrupt,
    switchTask,
  };
};
