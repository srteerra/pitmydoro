import { create } from 'zustand';
import { SessionStatusEnum } from '@/utils/enums/SessionStatus.enum';
import { TireTypeEnum } from '@/utils/enums/TireType.enum';
import { FlagEnum } from '@/utils/enums/Flag.enum';

interface SessionStore {
  status: SessionStatusEnum;
  flag: FlagEnum | null;
  isStopped: boolean;
  selectedTire: TireTypeEnum;
  isEndingSoon: boolean;
}

interface SessionActions {
  setStatus: (status: SessionStatusEnum) => void;
  setFlag: (flag: FlagEnum | null) => void;
  setIsStopped: (isStopped: boolean) => void;
  setSelectedTire: (tire: TireTypeEnum) => void;
  setIsEndingSoon: (val: boolean) => void;
}

const useSessionStore = create<SessionStore & SessionActions>((set) => ({
  status: SessionStatusEnum.IN_SESSION,
  selectedTire: TireTypeEnum.HARD,
  flag: null,
  isStopped: false,
  isEndingSoon: false,

  setStatus: (status) => set(() => ({ status })),
  setFlag: (flag) => set(() => ({ flag })),
  setIsStopped: (isStopped) => set(() => ({ isStopped })),
  setSelectedTire: (selectedTire) => set(() => ({ selectedTire })),
  setIsEndingSoon: (val: boolean) => set({ isEndingSoon: val }),
}));

export default useSessionStore;
