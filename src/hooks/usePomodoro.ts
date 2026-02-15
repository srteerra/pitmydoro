import { Pomodoro } from '@/interfaces/Pomodoro.interface';
import { Team } from '@/interfaces/Teams.interface';
import { Task } from '@/interfaces/Task.interface';
import { Timestamp } from 'firebase/firestore';
import { usePomodoroStore } from '@/stores/Pomodoro.store';
import { useAuth } from '@/contexts/AuthContext';
import { useTaskStore } from '@/stores/Tasks.store';
import { pomodoroService } from '@/services/pomodoro.service';
import { taskService } from '@/services/task.service';
import { useEffect, useMemo } from 'react';
import useSettingsStore from '@/stores/Settings.store';
import _ from 'lodash';

export const usePomodoro = () => {
  const { user } = useAuth();
  const { currentPomodoro, setCurrentPomodoro, updateCurrentPomodoro } = usePomodoroStore();
  const { currentTask, tasks, setCurrentTask } = useTaskStore();
  const autoStartNextTask = useSettingsStore((state) => state.autoStartNextTask);

  const incompleteTasks = useMemo(() => {
    return _.chain(tasks).reject('completedAt').sortBy('order').value();
  }, [tasks]);

  const start = async (
    type: 'session' | 'shortBreak' | 'longBreak',
    duration: number,
    team: Team,
    task?: Task
  ) => {
    if (!user) return;

    const taskToUse = task || currentTask || null;

    const pomodoroData: Omit<Pomodoro, 'id'> = {
      type,
      duration,
      startAt: Timestamp.now(),
      startTeam: team,
      task: taskToUse,
      endTeam: null,
    };

    const id = await pomodoroService.create(pomodoroData, user.uid);

    setCurrentPomodoro({
      ...pomodoroData,
      id,
      status: 'running',
      completed: false,
      interrupted: false,
      pauses: [],
    });
  };

  const pause = async () => {
    if (!currentPomodoro) return;

    const newPause = {
      pausedAt: Timestamp.now(),
      resumedAt: Timestamp.now(),
    };

    await pomodoroService.pause(currentPomodoro.id);

    updateCurrentPomodoro({
      status: 'paused',
      pauses: [...(currentPomodoro.pauses || []), newPause],
    });
  };

  const resume = async () => {
    if (!currentPomodoro || !currentPomodoro.pauses?.length) return;

    const pauses = [...currentPomodoro.pauses];
    pauses[pauses.length - 1].resumedAt = Timestamp.now();

    await pomodoroService.resume(currentPomodoro.id, pauses);

    updateCurrentPomodoro({
      status: 'running',
      pauses,
    });
  };

  const complete = async () => {
    if (!currentPomodoro || !user) return;

    await pomodoroService.complete(currentPomodoro.id);

    if (currentPomodoro.task && currentPomodoro.type === 'session') {
      const workMinutes = currentPomodoro.duration || 25;
      await taskService.incrementPomodoro(user.uid, currentPomodoro.task.id, workMinutes);
    }

    setCurrentPomodoro(null);
  };

  const interrupt = async () => {
    if (!currentPomodoro || !user) return;

    await pomodoroService.interrupt(currentPomodoro.id);

    if (currentPomodoro.task) {
      await taskService.incrementInterruption(user.uid, currentPomodoro.task.id);
    }

    setCurrentPomodoro(null);
  };

  const switchTask = async (newTask: Task) => {
    if (currentPomodoro && user) {
      await interrupt();
      useTaskStore.getState().setCurrentTask(newTask);
    } else {
      useTaskStore.getState().setCurrentTask(newTask);
    }
  };

  useEffect(() => {
    if (!tasks?.length) setCurrentTask(null);
  }, [tasks, setCurrentTask]);

  useEffect(() => {
    if (!autoStartNextTask) return;

    if (!currentTask || incompleteTasks.length === 1) {
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
