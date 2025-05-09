import usePomodoroStore from '@/stores/Pomodoro.store';
import { ITeam } from '@/interfaces/Teams.interface';
import useSessionStore from '@/stores/Session.store';
import useSettingsStore from '@/stores/Settings.store';
import { useEffect, useMemo, useState } from 'react';
import { ITask } from '@/interfaces/Task.interface';
import { SessionStatusEnum } from "@/utils/enums/SessionStatus.enum";
import moment from "moment";
import { IPomodoro } from "@/interfaces/Pomodoro.interface";
import { useAlert } from "@/hooks/useAlert";

export const usePomodoro = () => {
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const { toastSuccess } = useAlert();
  const tasks = usePomodoroStore((state) => state.tasks);
  const tiresSettings = useSettingsStore((state) => state.tiresSettings);
  const breaksInterval = useSettingsStore((state) => state.breaksInterval);
  const autoCompleteTask = useSettingsStore((state) => state.autoCompleteTask);
  const autoStartNextTask = useSettingsStore((state) => state.autoStartNextTask);
  const autoStartBreak = useSettingsStore((state) => state.autoStartBreak);
  const isLongBreakPerTask = useSettingsStore((state) => state.isLongBreakPerTask);
  const autoStartSession = useSettingsStore((state) => state.autoStartSession);

  const currentScuderia = usePomodoroStore((state) => state.currentScuderia);
  const currentTask = usePomodoroStore((state) => state.currentTask);
  const extPomodoros = usePomodoroStore((state) => state.extPomodoros);
  const selectedTire = useSessionStore((state) => state.selectedTire);
  const status = useSessionStore(state => state.status);

  const setCurrentTask = usePomodoroStore((state) => state.setCurrentTask);
  const addExtPomodoro = usePomodoroStore((state) => state.addExtPomodoro);
  const addTask = usePomodoroStore((state) => state.addTask);
  const setTasks = usePomodoroStore((state) => state.setTasks);
  const setStatus = useSessionStore(state => state.setStatus);
  const updateTask = usePomodoroStore((state) => state.updateTask);
  const updateTaskStatus = usePomodoroStore((state) => state.updateTaskStatus);
  const removeTask = usePomodoroStore((state) => state.removeTask);

  const allPomodoros = useMemo<IPomodoro[]>(() => {
    if (!tasks.length) return extPomodoros;
    const tasksPomodoros = tasks.flatMap((task) => task.pomodoros);
    return [...tasksPomodoros, ...extPomodoros];
  }, [tasks, extPomodoros]);

  const completedPomodoros = useMemo<number>(() => (allPomodoros.filter(pomodoro => pomodoro.completedAt).length), [allPomodoros]);

  const estTimeFinish = useMemo<string>(() => {
    if (!tasks.length) return moment().format("HH:mm");

    const tasksPomodoros = tasks.flatMap((task: ITask) => task.pomodoros);
    const incompletePomodoros = tasksPomodoros.filter((pomodoro: IPomodoro) => !pomodoro.completedAt);
    const timeNow = moment().valueOf();

    const totalDuration = incompletePomodoros.reduce((acc: number, pomodoro: IPomodoro) => {
      const duration = tiresSettings[selectedTire]?.duration;
      return acc + (duration * 60 * 1000);
    }, 0);

    return moment(timeNow + totalDuration).format("HH:mm");
  }, [tasks, tiresSettings, selectedTire]);

  const handleCompleteInterval = (): void => {
    switch (status) {
      case SessionStatusEnum.IN_SESSION:
        if (currentTask) {
          updateTask(currentTask.id, (prevTask: ITask) => {
            const currentPomodoros = prevTask.pomodoros || [];
            let foundUncompleted = false;

            const updatedPomodoros = currentPomodoros.map((pomodoro: IPomodoro) => {
              if (!pomodoro.completedAt && !foundUncompleted) {
                foundUncompleted = true;
                return {
                  ...pomodoro,
                  completedAt: moment().valueOf(),
                  duration: tiresSettings[selectedTire].duration,
                };
              }
              return pomodoro;
            });

            if (!foundUncompleted) {
              updatedPomodoros.push({
                id: crypto.randomUUID(),
                createdAt: moment().valueOf(),
                completedAt: moment().valueOf(),
                isExternal: true,
                duration: tiresSettings[selectedTire].duration,
                team: currentScuderia as ITeam,
              });
            }
            const incompleteRemaining = updatedPomodoros.filter(p => !p.completedAt).length;

            if (autoCompleteTask && incompleteRemaining === 0) {
              setTimeout(() => {
                handleCheckTask(prevTask.id, true);
              }, 100);
            }

            return {
              ...prevTask,
              pomodoros: updatedPomodoros,
            };
          });
        }

        if (autoStartBreak) {
          let totalPomodoros = 0;

          if (currentTask) {
            if (isLongBreakPerTask) {
              totalPomodoros = currentTask.pomodoros.filter((pomodoro) => pomodoro.completedAt).length;
            } else {
              totalPomodoros = completedPomodoros + 1;
            }
          } else {
            totalPomodoros = extPomodoros.length + 1;
          }

          if (totalPomodoros > 0 && totalPomodoros % breaksInterval === 0) {
            setStatus(SessionStatusEnum.LONG_BREAK);
          } else {
            setStatus(SessionStatusEnum.SHORT_BREAK);
          }
        }

        break;
      case SessionStatusEnum.SHORT_BREAK:
        if (!autoStartSession) break;
        setStatus(SessionStatusEnum.IN_SESSION);
        break;
      case SessionStatusEnum.LONG_BREAK:
        if (!autoStartSession) break;
        setStatus(SessionStatusEnum.IN_SESSION);
        break;
      default:
        break;
    }
  };

  const handleSetCurrentTask = () => {
    const incompleteTasks = tasks.filter((task) => !task.completed).sort((a, b) => a.order - b.order);
    setCurrentTask(incompleteTasks[0]);
  };

  const handleDeleteTask = (taskId: string) => {
    removeTask(taskId);
    if (!currentTask) handleSetCurrentTask();
  };

  const handleReorderTasks = (tasks: ITask[]) => {
    setTasks(tasks);

    tasks.forEach((task: ITask, index: number) => {
      updateTask(task.id, { order: index + 1 });
    });

    if (!currentTask) handleSetCurrentTask();
  };

  const handleEditTask = (taskId: string, data: any) => {
    const { title, description, taskCompletedPomodoros, numberOfPomodoros } = data;
    const currentTaskEditing = tasks.find((task) => task.id === taskId);

    if (!currentTaskEditing) return;
    if (!title) {
      removeTask(taskId);
      return;
    }

    let updatedPomodoros: any[] = [...currentTaskEditing.pomodoros];
    const currentCompletedCount = updatedPomodoros.filter((p) => p.completedAt).length;

    const totalToComplete = taskCompletedPomodoros ?? 0;

    if (totalToComplete !== currentCompletedCount) {
      if (totalToComplete > currentCompletedCount) {
        let remainingToComplete = totalToComplete - currentCompletedCount;

        updatedPomodoros = updatedPomodoros.map((pomodoro) => {
          if (remainingToComplete > 0 && !pomodoro.completedAt) {
            remainingToComplete--;
            return {
              ...pomodoro,
              completedAt: moment().valueOf(),
            };
          }
          return pomodoro;
        });

        if (remainingToComplete > 0) {
          const newPomodoros = Array.from({ length: remainingToComplete }, () => ({
            id: crypto.randomUUID(),
            createdAt: moment().valueOf(),
            completedAt: moment().valueOf(),
            skipped: true,
            duration: tiresSettings[selectedTire].duration,
            team: currentScuderia as ITeam,
          }));

          updatedPomodoros = [...updatedPomodoros, ...newPomodoros];
        }
      } else {
        let remainingToIncomplete = currentCompletedCount - totalToComplete;

        updatedPomodoros = updatedPomodoros.map((pomodoro) => {
          if (remainingToIncomplete > 0 && !!pomodoro.completedAt) {
            remainingToIncomplete--;
            return {
              ...pomodoro,
              completedAt: null,
              skipped: false,
            };
          }
          return pomodoro;
        });
      }
    }

    const currentCount = updatedPomodoros.length;

    if (numberOfPomodoros > currentCount) {
      const newPomodoros = Array.from({ length: numberOfPomodoros - currentCount }, () => ({
        id: crypto.randomUUID(),
        createdAt: moment().valueOf(),
        duration: tiresSettings[selectedTire].duration,
        team: currentScuderia as ITeam,
      }));

      updatedPomodoros = [...updatedPomodoros, ...newPomodoros];
    } else if (numberOfPomodoros < currentCount) {
      updatedPomodoros = updatedPomodoros.slice(0, numberOfPomodoros);
    }

    updateTask(taskId, {
      title: title ?? currentTaskEditing.title,
      description: description ?? currentTaskEditing.description,
      pomodoros: updatedPomodoros,
    });
  };

  const handleAddTask = (taskId?: string) => {
    const id = taskId || crypto.randomUUID();
    setEditingTask(id);

    const newTask = {
      id,
      title: '',
      completed: false,
      description: '',
      createdAt: moment().valueOf(),
      order: tasks.length + 1,
      pomodoros: [
        {
          id: crypto.randomUUID(),
          createdAt: moment().valueOf(),
          duration: tiresSettings[selectedTire].duration,
          team: currentScuderia as ITeam,
        },
      ],
    };

    addTask(newTask);
    if (!currentTask) setCurrentTask(newTask);
  };

  const handleCheckTask = (taskId: string, isCompleted: boolean) => {
    updateTaskStatus(taskId, isCompleted);
  };

  useEffect(() => {
    if (!autoStartNextTask) return;
    const incompleteTasks = tasks.filter((task) => !task.completed).sort((a, b) => a.order - b.order);

    if (!currentTask || incompleteTasks.length === 1) {
      setCurrentTask(incompleteTasks[0]);
    }
  }, [tasks, currentTask, autoStartNextTask]);

  useEffect(() => {
    if (!tasks?.length) setCurrentTask(null);
  }, [tasks]);

  return {
    allPomodoros,
    completedPomodoros,
    editingTask,
    estTimeFinish,
    handleAddTask,
    handleEditTask,
    setEditingTask,
    handleReorderTasks,
    handleCompleteInterval,
    handleCheckTask,
    handleDeleteTask,
  };
};
