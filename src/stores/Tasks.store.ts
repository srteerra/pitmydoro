import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Timestamp } from 'firebase/firestore';
import { Task, TaskStats, TaskStatsDelta } from '@/interfaces/Task.interface';

const emptyStats = (): TaskStats => ({
  totalWorkTime: 0,
  totalBreakTime: 0,
  totalPausedTime: 0,
  totalPauses: 0,
  totalInterruptions: 0,
  lastSessionAt: Timestamp.now(),
});

const mergeStats = (task: Task, delta: TaskStatsDelta): Task => {
  const stats = task.stats ?? emptyStats();

  return {
    ...task,
    totalPomodoros: task.totalPomodoros + (delta.pomodoros ?? 0),
    stats: {
      totalWorkTime: stats.totalWorkTime + (delta.workTime ?? 0),
      totalBreakTime: stats.totalBreakTime + (delta.breakTime ?? 0),
      totalPausedTime: stats.totalPausedTime + (delta.pausedTime ?? 0),
      totalPauses: stats.totalPauses + (delta.pauses ?? 0),
      totalInterruptions: stats.totalInterruptions + (delta.interruptions ?? 0),
      lastSessionAt: Timestamp.now(),
    },
  };
};

interface TaskStore {
  tasks: Task[];
  currentTask: Task | null;
  loading: boolean;
  editingTask: string | null;

  previousTasks: Task[] | null;
  previousCurrentTask: Task | null;

  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  applyTaskStats: (id: string, delta: TaskStatsDelta) => void;
  removeTask: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setEditingTask: (task: string | null) => void;

  setPreviousTasks: (tasks: Task[]) => void;
  setPreviousCurrentTask: (task: Task | null) => void;

  archiveAllTasks: () => void;
  unarchiveTasks: (ids: string[]) => void;

  setCurrentTask: (task: Task | null) => void;
  clearCurrentTask: () => void;
  resetAll: () => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: [],
      currentTask: null,
      loading: false,
      editingTask: null,

      previousTasks: [],
      previousCurrentTask: null,

      setEditingTask: (task) => set({ editingTask: task }),

      archiveAllTasks: () =>
        set((state) => ({
          tasks: state.tasks.map((t) => ({ ...t, archive: true })),
          currentTask: null,
          editingTask: null,
        })),

      unarchiveTasks: (ids: string[]) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (ids.includes(t.id) ? { ...t, archive: false } : t)),
        })),

      setTasks: (tasks) => set({ tasks }),

      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, task],
        })),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
          currentTask:
            state.currentTask?.id === id ? { ...state.currentTask, ...updates } : state.currentTask,
        })),

      applyTaskStats: (id, delta) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? mergeStats(t, delta) : t)),
          currentTask:
            state.currentTask?.id === id ? mergeStats(state.currentTask, delta) : state.currentTask,
        })),

      removeTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, archive: true } : t)),
          currentTask: state.currentTask?.id === id ? null : state.currentTask,
        })),

      setLoading: (loading) => set({ loading }),

      setCurrentTask: (task) => set({ currentTask: task }),

      clearCurrentTask: () => set({ currentTask: null }),

      setPreviousTasks: (tasks) => set({ previousTasks: tasks }),

      setPreviousCurrentTask: (task) => set({ previousCurrentTask: task }),

      resetAll: () => {
        set(() => ({
          currentTask: null,
          tasks: [],
          editingTask: null,
        }));
      },
    }),
    {
      name: 'pitmydoro_tasks',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tasks: state.tasks,
        currentTask: state.currentTask,
      }),
    }
  )
);
