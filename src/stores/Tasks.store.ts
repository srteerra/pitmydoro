import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Task } from '@/interfaces/Task.interface';

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
