import React, { useEffect } from 'react';
import { Team } from '@/interfaces/Teams.interface';
import { Task, TaskStatsDelta } from '@/interfaces/Task.interface';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useTaskStore } from '@/stores/Tasks.store';
import { taskService } from '@/services/task.service';
import useSettingsStore from '@/stores/Settings.store';
import _ from 'lodash';
import { SessionStatusEnum } from '@/enums/SessionStatus.enum';
import { useTasks } from '@/hooks/useTasks';
import { usePomodoroStore } from '@/stores/Pomodoro.store';
import useSessionStore from '@/stores/Session.store';
import { FlagEnum } from '@/enums/Flag.enum';
import moment from 'moment';
import { useAlert } from '@/hooks/useAlert';
import { TireTypeEnum } from '@/enums/TireType.enum';
import { useTranslations } from 'use-intl';
import { PomodoroMode } from '@/interfaces/Settings.interface';
import { flushElapsedCheckpoint, flushElapsedTime } from '@/utils/accountElapsed.utils';

export const usePomodoro = () => {
  const { user } = useAuth();
  const { confirmAlert } = useAlert();
  const { checkTask, handleReorderTasks } = useTasks();
  const t = useTranslations('pomodoro');

  const {
    currentPomodoro,
    isActive,
    isEndingSoon,
    estTimeFinish,
    setCurrentPomodoro,
    setIsActive,
    setIsEndingSoon,
    setEstTimeFinish,
    setAccountedAt,
    resetPomodoro,
  } = usePomodoroStore();

  const { currentTask, tasks, setCurrentTask, applyTaskStats } = useTaskStore();

  const status = useSessionStore((state) => state.status);
  const selectedTire = useSessionStore((state) => state.selectedTire);
  const setStatus = useSessionStore((state) => state.setStatus);
  const setFlag = useSessionStore((state) => state.setFlag);
  const setStopped = useSessionStore((state) => state.setIsStopped);
  const setDateClock = useSessionStore((state) => state.setDateClock);
  const setSelectedTire = useSessionStore((state) => state.setSelectedTire);

  const autoStartNextTask = useSettingsStore((state) => state.autoStartNextTask);
  const autoOrderTasks = useSettingsStore((state) => state.autoOrderTasks);
  const autoCompleteTask = useSettingsStore((state) => state.autoCompleteTask);
  const autoStartBreak = useSettingsStore((state) => state.autoStartBreak);
  const breaksInterval = useSettingsStore((state) => state.breaksInterval);
  const autoStartSession = useSettingsStore((state) => state.autoStartSession);
  const tiresSettings = useSettingsStore((state) => state.tiresSettings);
  const breaksDuration = useSettingsStore((state) => state.breaksDuration);
  const mode = useSettingsStore((state) => state.mode);
  const minimalSessionDuration = useSettingsStore((state) => state.minimalSessionDuration);

  const activeTasks = React.useMemo(() => tasks.filter((t) => !t.archive), [tasks]);

  const incompleteTasks = React.useMemo(() => {
    return _.chain(activeTasks).reject('completedAt').sortBy('order').value();
  }, [activeTasks]);

  const completedPomodoros = React.useMemo(() => {
    return _.chain(activeTasks).reject('completedAt').sumBy('totalPomodoros').value();
  }, [activeTasks]);

  const incompletePomodoros = React.useMemo(() => {
    return _.chain(activeTasks).reject('completedAt').sumBy('estimatedPomodoros').value();
  }, [activeTasks]);

  const getCurrentDuration = (newTimer?: TireTypeEnum): number => {
    const sessionMinutes =
      mode === PomodoroMode.MINIMAL
        ? minimalSessionDuration
        : tiresSettings[newTimer ?? selectedTire].duration;

    const newTime =
      status === SessionStatusEnum.LONG_BREAK
        ? breaksDuration[SessionStatusEnum.LONG_BREAK]
        : status === SessionStatusEnum.SHORT_BREAK
          ? breaksDuration[SessionStatusEnum.SHORT_BREAK]
          : sessionMinutes;

    return moment.duration(Number(newTime), 'minutes').asMilliseconds();
  };

  const applyStats = async (taskId: string, delta: TaskStatsDelta) => {
    applyTaskStats(taskId, delta);

    if (user) {
      await taskService.updateTaskStats(user.uid, taskId, delta);
    }
  };

  const flushElapsed = async () => {
    await flushElapsedTime(user?.uid);
  };

  const flushCheckpoint = async () => {
    await flushElapsedCheckpoint(user?.uid);
  };

  const updateEstimatedFinish = (totalRemainingMs: number) => {
    const now = Date.now();
    const tireDuration =
      mode === PomodoroMode.MINIMAL
        ? minimalSessionDuration
        : (tiresSettings[selectedTire]?.duration ?? 25);
    const msPerPomodoro = tireDuration * 60 * 1000;
    const remainingFuture = (incompletePomodoros - 1) * msPerPomodoro;
    const totalRemaining = Math.max(totalRemainingMs, 0) + Math.max(remainingFuture, 0);
    const newEst = moment(now + totalRemaining).format('HH:mm');
    setEstTimeFinish(newEst);
  };

  const changeCompoundTime = (selectedTire: TireTypeEnum) => {
    setSelectedTire(selectedTire);
    reset(selectedTire);
  };

  const start = async (type: SessionStatusEnum, duration: number, team: Team, task?: Task) => {
    try {
      setIsActive(true);
      setStopped(false);

      const taskToUse = task || currentTask || null;

      setCurrentPomodoro({
        type,
        duration,
        startAt: Timestamp.now(),
        startTeam: team,
        task: taskToUse,
        status: 'running',
      });

      setAccountedAt(Date.now());

      if (type === SessionStatusEnum.IN_SESSION) {
        setFlag(FlagEnum.GREEN);
      } else {
        setFlag(null);
      }
    } catch (error) {
      console.error('Error starting pomodoro:', error);
      throw error;
    }
  };

  const pause = async () => {
    document.title = `Pitmydoro - ${t('pausedTitle')}`;

    setIsActive(false);
    setStopped(true);

    if (status === SessionStatusEnum.IN_SESSION) setFlag(FlagEnum.YELLOW);

    if (!currentPomodoro?.task) return;

    if (currentPomodoro.status === 'paused') {
      console.warn('Pomodoro already paused');
      return;
    }

    try {
      const taskId = currentPomodoro.task.id;

      await flushElapsed();

      setCurrentPomodoro({
        ...currentPomodoro,
        status: 'paused',
        currentPauseStart: Timestamp.now(),
      });
      setAccountedAt(Date.now());

      if (status === SessionStatusEnum.IN_SESSION) {
        await applyStats(taskId, { pauses: 1 });
      } else {
        setFlag(null);
      }
    } catch (error) {
      console.error('Error pausing pomodoro:', error);
      throw error;
    }
  };

  const resume = async () => {
    setIsActive(true);
    setStopped(false);

    if (status === SessionStatusEnum.IN_SESSION) setFlag(FlagEnum.GREEN);
    else setFlag(null);

    if (!currentPomodoro?.task) return;
    if (currentPomodoro.status !== 'paused') return;

    try {
      await flushElapsed();

      setCurrentPomodoro({
        ...currentPomodoro,
        status: 'running',
        currentPauseStart: undefined,
      });
      setAccountedAt(Date.now());
    } catch (error) {
      console.error('Error resuming pomodoro:', error);
      throw error;
    }
  };

  const complete = async () => {
    document.title = `${t('boxTitle')}`;

    setIsActive(false);
    setStopped(true);

    if (!currentPomodoro) {
      return;
    }

    try {
      await flushElapsed();

      if (currentPomodoro.type === SessionStatusEnum.IN_SESSION) {
        if (autoStartBreak) {
          const taskInCaseStore = tasks.find((t) => t.id === currentPomodoro?.task?.id);
          const newTotalPomodoros = (taskInCaseStore?.totalPomodoros || 0) + 1;
          const shouldBeLongBreak =
            currentPomodoro.task &&
            newTotalPomodoros > 0 &&
            newTotalPomodoros % breaksInterval === 0;

          setStatus(
            shouldBeLongBreak ? SessionStatusEnum.LONG_BREAK : SessionStatusEnum.SHORT_BREAK
          );
        }

        if (currentPomodoro.task) {
          const task = currentPomodoro.task;
          const taskInStore = useTaskStore.getState().tasks.find((t) => t.id === task.id);

          if (!taskInStore) {
            setCurrentPomodoro(null);
            setAccountedAt(null);
            return;
          }

          const newTotalPomodoros = taskInStore.totalPomodoros + 1;

          await applyStats(task.id, { pomodoros: 1 });

          const shouldCompleteTask =
            !taskInStore.completedAt &&
            taskInStore.estimatedPomodoros <= newTotalPomodoros &&
            autoCompleteTask;

          if (shouldCompleteTask) {
            await checkTask(task.id, true);
            await new Promise((resolve) => setTimeout(resolve, 100));

            const freshTasks = useTaskStore.getState().tasks;

            const freshIncompleteTasks = _.chain(freshTasks)
              .filter((t) => !t.completedAt)
              .sortBy('order')
              .value();

            if (autoStartNextTask && freshIncompleteTasks.length > 0) {
              await switchTask(freshIncompleteTasks[0], true);
            }

            if (autoOrderTasks) {
              const freshCompletedTasks = _.chain(freshTasks)
                .filter((t) => !!t.completedAt)
                .sortBy('completedAt')
                .value();

              const orderedTasks = [...freshIncompleteTasks, ...freshCompletedTasks];
              await handleReorderTasks(orderedTasks);
            }
          }
        }
      }

      if (
        currentPomodoro.type === SessionStatusEnum.SHORT_BREAK ||
        currentPomodoro.type === SessionStatusEnum.LONG_BREAK
      ) {
        if (autoStartSession) setStatus(SessionStatusEnum.IN_SESSION);
      }

      setCurrentPomodoro(null);
      setAccountedAt(null);
      setIsActive(false);
      setStopped(true);
    } catch (error) {
      console.error('Error completing pomodoro:', error);
      throw error;
    }
  };

  const reset = (newTire?: TireTypeEnum | null, showRedFlag = false) => {
    document.title = `Pitmydoro - ${t('pausedTitle')}`;

    void flushElapsed();

    if (showRedFlag || currentPomodoro?.status === 'running') setFlag(FlagEnum.RED);
    setStopped(true);

    const sessionMinutes =
      mode === PomodoroMode.MINIMAL
        ? minimalSessionDuration
        : tiresSettings[newTire ?? selectedTire].duration;

    const newTime =
      status === SessionStatusEnum.LONG_BREAK
        ? breaksDuration[SessionStatusEnum.LONG_BREAK]
        : status === SessionStatusEnum.SHORT_BREAK
          ? breaksDuration[SessionStatusEnum.SHORT_BREAK]
          : sessionMinutes;

    const duration = moment.duration(Number(newTime), 'minutes').asMilliseconds();
    setDateClock(Date.now() + duration);

    resetPomodoro();
  };

  const interrupt = async () => {
    const taskId = currentPomodoro?.task?.id;
    if (!taskId) return reset();

    try {
      await applyStats(taskId, { interruptions: 1 });
      reset();
    } catch (error) {
      console.error('Error interrupting pomodoro:', error);
      reset();
      throw error;
    }
  };

  const switchTask = async (newTask: Task, bypassInterrupt?: boolean) => {
    if (!newTask) return;

    try {
      if (currentPomodoro?.task && newTask.id !== currentPomodoro.task.id && !bypassInterrupt) {
        if (isActive && user) {
          if (!(await confirmAlert(t('interruptAccept')))) return;
          await interrupt();
        } else {
          await flushElapsed();
          setCurrentPomodoro({ ...currentPomodoro, task: newTask });
        }
      }

      setCurrentTask(newTask);
    } catch (error) {
      console.error('Error switching task:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (!tasks?.length) {
      setCurrentTask(null);
    }
  }, [tasks, setCurrentTask]);

  return {
    currentPomodoro,
    currentTask,
    isEndingSoon,
    estTimeFinish,
    incompleteTasks,
    incompletePomodoros,
    completedPomodoros,
    changeCompoundTime,
    start,
    pause,
    resume,
    complete,
    interrupt,
    reset,
    switchTask,
    flushElapsed,
    flushCheckpoint,
    setIsEndingSoon,
    updateEstimatedFinish,
    getCurrentDuration,
  };
};
