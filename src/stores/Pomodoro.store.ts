import { create } from 'zustand';
import { Pomodoro } from '@/interfaces/Pomodoro.interface';

interface PomodoroStore {
  currentPomodoro: Pomodoro | null;
  isActive: boolean;
  isEndingSoon: boolean;
  estTimeFinish: string;
  resetTrigger: number;

  setCurrentPomodoro: (pomodoro: Pomodoro | null) => void;
  setIsActive: (isActive: boolean) => void;
  setIsEndingSoon: (isEndingSoon: boolean) => void;
  setEstTimeFinish: (time: string) => void;
  triggerReset: () => void;
  resetPomodoro: () => void;
}

export const usePomodoroStore = create<PomodoroStore>((set) => ({
  currentPomodoro: null,
  isActive: false,
  isEndingSoon: false,
  estTimeFinish: '',
  resetTrigger: 0,

  setCurrentPomodoro: (pomodoro) => set({ currentPomodoro: pomodoro }),
  setIsActive: (isActive) => set({ isActive }),
  setIsEndingSoon: (isEndingSoon) => set({ isEndingSoon }),
  setEstTimeFinish: (time) => set({ estTimeFinish: time }),
  triggerReset: () => set((state) => ({ resetTrigger: state.resetTrigger + 1 })),
  resetPomodoro: () =>
    set((state) => ({
      currentPomodoro: null,
      isActive: false,
      isEndingSoon: false,
      resetTrigger: state.resetTrigger + 1,
    })),
}));
