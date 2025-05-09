import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { ITeam } from "@/interfaces/Teams.interface";
import { ITask } from "@/interfaces/Task.interface";
import { IPomodoro } from "@/interfaces/Pomodoro.interface";
import useSettingsStore from "@/stores/Settings.store";

interface PomodoroStore {
  currentScuderia: ITeam | null;
  currentTask: ITask | null;
  tasks: ITask[];
  extPomodoros: IPomodoro[];
}

interface PomodoroActions {
  setCurrentScuderia: (scuderia: ITeam) => void;
  setCurrentTask: (task: ITask | null) => void;
  addExtPomodoro: (pomodoro: IPomodoro) => void;
  setTasks: (tasks: ITask[]) => void;
  addTask: (task: ITask) => void;
  removeTask: (taskId: string) => void;
  updateTaskStatus: (taskId: string, isCompleted: boolean) => void;
  updateTask: (taskId: string, data: any) => void;
  resetSession: () => void;
}

const usePomodoroStore = create<PomodoroStore & PomodoroActions>()(
  devtools(
    persist(
      (set) => ({
        currentScuderia: null,
        currentTask: null,
        tasks: [],
        extPomodoros: [],
        addExtPomodoro: (pomodoro) => set((state) => ({ extPomodoros: [...state.extPomodoros, pomodoro] })),
        setCurrentScuderia: (scuderia) => set(() => ({ currentScuderia: scuderia })),
        setCurrentTask: (task) => set(() => ({ currentTask: task })),
        setTasks: (tasks) => set(() => ({ tasks })),
        addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
        removeTask: (taskId) => set((state) => ({ tasks: state.tasks.filter((task) => task.id !== taskId) })),
        updateTask: (taskId, updater) =>
          set((state) => ({
            tasks: state.tasks.map((task) => {
              if (task.id === taskId) {
                return typeof updater === "function" ? updater(task) : { ...task, ...updater };
              }
              return task;
            }),
          })),
        updateTaskStatus: (taskId, isCompleted) => {
          set((state) => {
            let updatedTasks = state.tasks.map((task) =>
              task.id === taskId ? { ...task, completed: isCompleted } : task
            );

            const autoOrderTasks = useSettingsStore.getState().autoOrderTasks;
            const autoStartNextTask = useSettingsStore.getState().autoStartNextTask;

            if (autoOrderTasks) {
              updatedTasks = [...updatedTasks].sort((a, b) => Number(a.completed) - Number(b.completed));
              updatedTasks = updatedTasks.map((task, index) => ({
                ...task,
                order: index + 1,
              }));
            }

            let newCurrentTask = state.currentTask;

            if (newCurrentTask?.id === taskId) {
              newCurrentTask = null;
            }

            if (autoStartNextTask) {
              const incompleteTasks = updatedTasks
                .filter((task) => !task.completed && task.id !== taskId)
                .sort((a, b) => a.order - b.order);

              if (!newCurrentTask) {
                newCurrentTask = incompleteTasks[0] || null;
              }
            }

            return {
              tasks: updatedTasks,
              currentTask: newCurrentTask,
            };
          });
        },
        resetSession: () => {
          set(() => ({
            currentTask: null,
            tasks: [],
            extPomodoros: [],
          }));
        },
      }),
      {
        name: "session-pitmydoro",
        storage: typeof window !== "undefined" ? createJSONStorage(() => localStorage) : undefined,
      }
    )
  )
);

export default usePomodoroStore;
