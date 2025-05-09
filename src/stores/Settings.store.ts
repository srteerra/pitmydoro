import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { TireTypeEnum } from "@/utils/enums/TireType.enum";
import { DefaultSettings } from "@/utils/constants/DefaultSettings";
import { ISettings, TireSettings } from "@/interfaces/Settings.interface";

interface SettingsActions {
  setTiresSettings: (tiresSettings: Record<TireTypeEnum, TireSettings>) => void;
  updateTireDuration: (type: TireTypeEnum, duration: number) => void;
  setBreaksInterval: (interval: number) => void;
  setBreaksDuration: (breaksDuration: Record<string, number>) => void;
  updateBreakDuration: (type: string, duration: number) => void;
  setAutoStartSession: (autoStartSession: boolean) => void;
  setAutoStartBreak: (autoStartBreak: boolean) => void;
  setAutoCompleteTask: (autoCompleteTask: boolean) => void;
  setAutoOrderTasks: (autoOrderTasks: boolean) => void;
  setAutoStartNextTask: (autoStartNextTask: boolean) => void;
  setIsLongBreakPerTask: (longBreakPerTask: boolean) => void;
}

const useSettingsStore = create<ISettings & SettingsActions>()(
  devtools(
    persist(
      (set) => ({
        tiresSettings: DefaultSettings.tiresSettings,
        breaksInterval: DefaultSettings.breaksInterval,
        breaksDuration: DefaultSettings.breaksDuration,
        autoStartSession: DefaultSettings.autoStartSession,
        autoStartBreak: DefaultSettings.autoStartBreak,
        autoCompleteTask: DefaultSettings.autoCompleteTask,
        autoOrderTasks: DefaultSettings.autoOrderTasks,
        autoStartNextTask: DefaultSettings.autoStartNextTask,
        isLongBreakPerTask: DefaultSettings.isLongBreakPerTask,
        setIsLongBreakPerTask: (longBreakPerTask) => set(() => ({ isLongBreakPerTask: longBreakPerTask })),
        setAutoStartNextTask: (autoStartNextTask) => set(() => ({ autoStartNextTask })),
        setAutoStartSession: (autoStartSession) => set(() => ({ autoStartSession })),
        setAutoStartBreak: (autoStartBreak) => set(() => ({ autoStartBreak })),
        setAutoCompleteTask: (autoCompleteTask) => set(() => ({ autoCompleteTask })),
        setAutoOrderTasks: (autoOrderTasks) => set(() => ({ autoOrderTasks })),
        setBreaksInterval: (interval) => set(() => ({ breaksInterval: interval })),
        setTiresSettings: (tiresSettings) => set(() => ({ tiresSettings })),
        updateTireDuration: (type, duration) => set((state) => ({
          tiresSettings: {
            ...state.tiresSettings,
            [type]: {
              ...state.tiresSettings[type],
              duration
            }
          }
        })),
        setBreaksDuration: (breaksDuration) => set(() => ({ breaksDuration })),
        updateBreakDuration: (type, duration) => set((state) => ({
          breaksDuration: {
            ...state.breaksDuration,
            [type]: duration
          }
        })),
      }),
      {
        name: "settings-pitmydoro",
        storage: typeof window !== "undefined" ? createJSONStorage(() => localStorage) : undefined,
      }
    )
  )
);

export default useSettingsStore;
