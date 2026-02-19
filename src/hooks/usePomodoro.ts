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
import useSessionStore from '@/stores/Session.store';
import { FlagEnum } from '@/enums/Flag.enum';
import moment from 'moment';
import { useAlert } from '@/hooks/useAlert';
import { TireTypeEnum } from '@/enums/TireType.enum';
import { useTranslations } from 'use-intl';

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
    resetPomodoro,
  } = usePomodoroStore();

  const { currentTask, tasks, setCurrentTask, updateTask } = useTaskStore();

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

  const incompleteTasks = useMemo(() => {
    return _.chain(tasks).reject('completedAt').sortBy('order').value();
  }, [tasks]);

  const incompletePomodoros = useMemo(() => {
    return _.chain(tasks)
      .filter((task) => !task.completedAt)
      .sumBy('estimatedPomodoros')
      .value();
  }, [tasks]);

  const getCurrentDuration = (newTimer?: TireTypeEnum): number => {
    const newTime =
      status === SessionStatusEnum.LONG_BREAK
        ? breaksDuration[SessionStatusEnum.LONG_BREAK]
        : status === SessionStatusEnum.SHORT_BREAK
          ? breaksDuration[SessionStatusEnum.SHORT_BREAK]
          : tiresSettings[newTimer ?? selectedTire].duration;

    return moment.duration(Number(newTime), 'minutes').asMilliseconds();
  };

  const calculatePausedTime = (pauses?: Array<{ pausedAt: any; resumedAt: any }>) => {
    if (!pauses || pauses.length === 0) return 0;

    const convertToMillis = (timestamp: any): number => {
      if (!timestamp) return 0;

      try {
        if (timestamp.toMillis && typeof timestamp.toMillis === 'function') {
          return timestamp.toMillis();
        }

        if (timestamp.seconds !== undefined && timestamp.nanoseconds !== undefined) {
          return timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
        }

        if (typeof timestamp === 'number') {
          return timestamp;
        }

        return 0;
      } catch (error) {
        console.error('Error converting timestamp:', error, timestamp);
        return 0;
      }
    };

    return pauses.reduce((total, pause) => {
      if (!pause.resumedAt) return total;

      const pausedMs = convertToMillis(pause.pausedAt);
      const resumedMs = convertToMillis(pause.resumedAt);

      if (pausedMs === 0 || resumedMs === 0) {
        console.warn('Invalid pause timestamps:', pause);
        return total;
      }

      const diff = resumedMs - pausedMs;
      return total + Math.max(0, diff);
    }, 0);
  };

  const updateEstimatedFinish = (totalRemainingMs: number) => {
    const now = Date.now();
    const tireDuration = tiresSettings[selectedTire]?.duration ?? 25;
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
      const pausedAt = Timestamp.now();

      setCurrentPomodoro({
        ...currentPomodoro,
        status: 'paused',
        currentPauseStart: pausedAt,
      });

      if (status === SessionStatusEnum.IN_SESSION) {
        if (user) {
          await taskService.updateTaskStats(user.uid, currentPomodoro.task.id, {
            pauses: 1,
          });

          await taskService.addPauseToTask(user.uid, currentPomodoro.task.id, {
            pausedAt,
            resumedAt: null,
          });
        }
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
      const resumedAt = Timestamp.now();

      setCurrentPomodoro({
        ...currentPomodoro,
        status: 'running',
        currentPauseStart: undefined,
      });

      if (user) {
        await taskService.updateLastPause(user.uid, currentPomodoro.task.id, resumedAt);

        if (currentPomodoro.currentPauseStart && status === SessionStatusEnum.IN_SESSION) {
          const convertToMillis = (timestamp: any): number => {
            if (!timestamp) return 0;
            if (timestamp.toMillis && typeof timestamp.toMillis === 'function') {
              return timestamp.toMillis();
            }
            if (timestamp.seconds !== undefined && timestamp.nanoseconds !== undefined) {
              return timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
            }
            if (typeof timestamp === 'number') {
              return timestamp;
            }
            return 0;
          };

          const pausedMs = convertToMillis(currentPomodoro.currentPauseStart);
          const resumedMs = convertToMillis(resumedAt);
          const pausedMillis = Math.max(0, resumedMs - pausedMs);

          await taskService.updateTaskStats(user.uid, currentPomodoro.task.id, {
            pausedTime: pausedMillis,
          });
        }
      }
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
      if (currentPomodoro.type === SessionStatusEnum.IN_SESSION) {
        if (currentPomodoro.task) {
          const task = currentPomodoro.task;
          const taskInStore = tasks.find((t) => t.id === task.id);

          if (!taskInStore) {
            setCurrentPomodoro(null);
            return;
          }

          const newTotalPomodoros = taskInStore.totalPomodoros + 1;
          updateTask(task.id, { totalPomodoros: newTotalPomodoros, pauses: [] });

          if (autoStartBreak) {
            const shouldBeLongBreak =
              newTotalPomodoros > 0 && newTotalPomodoros % breaksInterval === 0;
            setStatus(
              shouldBeLongBreak ? SessionStatusEnum.LONG_BREAK : SessionStatusEnum.SHORT_BREAK
            );
          }

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

          if (user) {
            const pausedTimeMs = calculatePausedTime(taskInStore.pauses);
            const workTimeMinutes = Math.max(
              0,
              currentPomodoro.duration - pausedTimeMs / 1000 / 60
            );

            await taskService.updateTaskStats(user.uid, task.id, {
              workTime: workTimeMinutes > 0 ? workTimeMinutes : currentPomodoro.duration,
              pomodoros: 1,
            });

            await taskService.update(user.uid, task.id, { pauses: [] });
          }
        }
      }

      if (
        (currentPomodoro.type === SessionStatusEnum.SHORT_BREAK ||
          currentPomodoro.type === SessionStatusEnum.LONG_BREAK) &&
        currentPomodoro.task
      ) {
        if (autoStartSession) setStatus(SessionStatusEnum.IN_SESSION);

        if (user) {
          await taskService.updateTaskStats(user.uid, currentPomodoro.task.id, {
            breakTime: currentPomodoro.duration,
          });
        }
      }

      setCurrentPomodoro(null);
      setIsActive(false);
      setStopped(true);
    } catch (error) {
      console.error('Error completing pomodoro:', error);
      throw error;
    }
  };

  const reset = (newTire?: TireTypeEnum | null, showRedFlag = false) => {
    document.title = `Pitmydoro - ${t('pausedTitle')}`;

    if (showRedFlag || currentPomodoro?.status === 'running') setFlag(FlagEnum.RED);
    setStopped(true);

    const newTime =
      status === SessionStatusEnum.LONG_BREAK
        ? breaksDuration[SessionStatusEnum.LONG_BREAK]
        : status === SessionStatusEnum.SHORT_BREAK
          ? breaksDuration[SessionStatusEnum.SHORT_BREAK]
          : tiresSettings[newTire ?? selectedTire].duration;

    const duration = moment.duration(Number(newTime), 'minutes').asMilliseconds();
    setDateClock(Date.now() + duration);

    resetPomodoro();
  };

  const interrupt = async () => {
    if (!currentPomodoro?.task?.id) return;
    if (!user) return reset();

    try {
      updateTask(currentPomodoro.task.id, { pauses: [] });

      await taskService.updateTaskStats(user.uid, currentPomodoro.task.id, {
        interruptions: 1,
      });

      await taskService.update(user.uid, currentPomodoro.task.id, { pauses: [] });

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
      if (
        isActive &&
        !bypassInterrupt &&
        currentPomodoro?.task &&
        newTask.id !== currentPomodoro.task.id &&
        user
      ) {
        if (!(await confirmAlert(t('interruptAccept')))) return;
        await interrupt();
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
    changeCompoundTime,
    start,
    pause,
    resume,
    complete,
    interrupt,
    reset,
    switchTask,
    setIsEndingSoon,
    updateEstimatedFinish,
    getCurrentDuration,
  };
};
