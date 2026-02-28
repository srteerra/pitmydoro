import { create } from 'zustand';
import { SessionStatusEnum } from '@/enums/SessionStatus.enum';
import { TireTypeEnum } from '@/enums/TireType.enum';
import { FlagEnum } from '@/enums/Flag.enum';

interface SessionStore {
  status: SessionStatusEnum;
  flag: FlagEnum | null;
  isStopped: boolean;
  selectedTire: TireTypeEnum;
  timerDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  isEndingSoon: boolean;
  estTimeFinish: string;
  dateClock: number;
}

interface SessionActions {
  setStatus: (status: SessionStatusEnum) => void;
  setFlag: (flag: FlagEnum | null) => void;
  setIsStopped: (isStopped: boolean) => void;
  setSelectedTire: (tire: TireTypeEnum) => void;
  setTimerDuration: (duration: number) => void;
  setShortBreakDuration: (duration: number) => void;
  setLongBreakDuration: (duration: number) => void;
  setIsEndingSoon: (val: boolean) => void;
  setEstTimeFinish: (estTimeFinish: string) => void;
  setDateClock: (dateClock: number) => void;
}

const useSessionStore = create<SessionStore & SessionActions>((set) => ({
  status: SessionStatusEnum.IN_SESSION,
  selectedTire: TireTypeEnum.HARD,
  timerDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  flag: null,
  isStopped: false,
  isEndingSoon: false,
  estTimeFinish: '',
  dateClock: Date.now() + 1000000,

  setStatus: (status) => set(() => ({ status })),
  setFlag: (flag) => set(() => ({ flag })),
  setIsStopped: (isStopped) => set(() => ({ isStopped })),
  setSelectedTire: (selectedTire) => set(() => ({ selectedTire })),
  setTimerDuration: (duration) => set(() => ({ timerDuration: duration })),
  setShortBreakDuration: (duration) => set(() => ({ shortBreakDuration: duration })),
  setLongBreakDuration: (duration) => set(() => ({ longBreakDuration: duration })),
  setIsEndingSoon: (val: boolean) => set({ isEndingSoon: val }),
  setEstTimeFinish: (time: string) => set({ estTimeFinish: time }),
  setDateClock: (dateClock: number) => set({ dateClock }),
}));

export default useSessionStore;
