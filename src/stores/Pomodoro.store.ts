import { create } from 'zustand';
import { CarryMs, Pomodoro, PomodoroEntryDraft } from '@/interfaces/Pomodoro.interface';

const emptyCarry = (): CarryMs => ({ work: 0, paused: 0, break: 0 });

interface PomodoroStore {
  currentPomodoro: Pomodoro | null;
  currentPomodoroEntry: PomodoroEntryDraft | null;
  isActive: boolean;
  isEndingSoon: boolean;
  estTimeFinish: string;
  resetTrigger: number;
  accountedAt: number | null;
  carryMs: CarryMs;
  breakBaseline: number | null;
  overlayEndsAt: number | null;
  overlayRemainingMs: number | null;

  setCurrentPomodoro: (pomodoro: Pomodoro | null) => void;
  setCurrentPomodoroEntry: (entry: PomodoroEntryDraft | null) => void;
  setIsActive: (isActive: boolean) => void;
  setIsEndingSoon: (isEndingSoon: boolean) => void;
  setEstTimeFinish: (time: string) => void;
  setAccountedAt: (accountedAt: number | null) => void;
  setCarryMs: (carryMs: CarryMs) => void;
  resetCarryMs: () => void;
  setBreakBaseline: (breakBaseline: number | null) => void;
  setOverlayTiming: (timing: { endsAt: number | null; remainingMs: number | null }) => void;
  triggerReset: () => void;
  resetPomodoro: () => void;
}

export const usePomodoroStore = create<PomodoroStore>((set) => ({
  currentPomodoro: null,
  currentPomodoroEntry: null,
  isActive: false,
  isEndingSoon: false,
  estTimeFinish: '',
  resetTrigger: 0,
  accountedAt: null,
  carryMs: emptyCarry(),
  breakBaseline: null,
  overlayEndsAt: null,
  overlayRemainingMs: null,

  setCurrentPomodoro: (pomodoro) => set({ currentPomodoro: pomodoro }),
  setCurrentPomodoroEntry: (entry) => set({ currentPomodoroEntry: entry }),
  setIsActive: (isActive) => set({ isActive }),
  setIsEndingSoon: (isEndingSoon) => set({ isEndingSoon }),
  setEstTimeFinish: (time) => set({ estTimeFinish: time }),
  setAccountedAt: (accountedAt) => set({ accountedAt }),
  setCarryMs: (carryMs) => set({ carryMs }),
  resetCarryMs: () => set({ carryMs: emptyCarry() }),
  setBreakBaseline: (breakBaseline) => set({ breakBaseline }),
  setOverlayTiming: ({ endsAt, remainingMs }) =>
    set({ overlayEndsAt: endsAt, overlayRemainingMs: remainingMs }),
  triggerReset: () => set((state) => ({ resetTrigger: state.resetTrigger + 1 })),
  resetPomodoro: () =>
    set((state) => ({
      currentPomodoro: null,
      isActive: false,
      isEndingSoon: false,
      accountedAt: null,
      carryMs: emptyCarry(),
      overlayEndsAt: null,
      resetTrigger: state.resetTrigger + 1,
    })),
}));
