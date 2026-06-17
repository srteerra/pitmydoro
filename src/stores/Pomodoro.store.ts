import { create } from 'zustand';
import { Pomodoro } from '@/interfaces/Pomodoro.interface';

interface PomodoroStore {
  currentPomodoro: Pomodoro | null;
  isActive: boolean;
  isEndingSoon: boolean;
  estTimeFinish: string;
  resetTrigger: number;
  accountedAt: number | null;

  setCurrentPomodoro: (pomodoro: Pomodoro | null) => void;
  setIsActive: (isActive: boolean) => void;
  setIsEndingSoon: (isEndingSoon: boolean) => void;
  setEstTimeFinish: (time: string) => void;
  setAccountedAt: (accountedAt: number | null) => void;
  triggerReset: () => void;
  resetPomodoro: () => void;
}

export const usePomodoroStore = create<PomodoroStore>((set) => ({
  currentPomodoro: null,
  isActive: false,
  isEndingSoon: false,
  estTimeFinish: '',
  resetTrigger: 0,
  accountedAt: null,

  setCurrentPomodoro: (pomodoro) => set({ currentPomodoro: pomodoro }),
  setIsActive: (isActive) => set({ isActive }),
  setIsEndingSoon: (isEndingSoon) => set({ isEndingSoon }),
  setEstTimeFinish: (time) => set({ estTimeFinish: time }),
  setAccountedAt: (accountedAt) => set({ accountedAt }),
  triggerReset: () => set((state) => ({ resetTrigger: state.resetTrigger + 1 })),
  resetPomodoro: () =>
    set((state) => ({
      currentPomodoro: null,
      isActive: false,
      isEndingSoon: false,
      accountedAt: null,
      resetTrigger: state.resetTrigger + 1,
    })),
}));
