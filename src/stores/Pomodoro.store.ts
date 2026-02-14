import { create } from 'zustand';
import { Pomodoro } from '@/interfaces/Pomodoro.interface';

interface PomodoroStore {
  currentPomodoro: Pomodoro | null;

  setCurrentPomodoro: (pomodoro: Pomodoro | null) => void;
  updateCurrentPomodoro: (updates: Partial<Pomodoro>) => void;
}

export const usePomodoroStore = create<PomodoroStore>((set) => ({
  currentPomodoro: null,

  setCurrentPomodoro: (pomodoro) => set({ currentPomodoro: pomodoro }),

  updateCurrentPomodoro: (updates) =>
    set((state) => ({
      currentPomodoro: state.currentPomodoro ? { ...state.currentPomodoro, ...updates } : null,
    })),
}));
