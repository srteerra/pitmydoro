import { TireTypeEnum } from "@/utils/enums/TireType.enum";
import { SessionStatusEnum } from "@/utils/enums/SessionStatus.enum";
import { ISettings } from "@/interfaces/Settings.interface";

export const DefaultSettings: ISettings = {
  breaksInterval: 2,
  isLongBreakPerTask: false,
  breaksDuration: {
    [SessionStatusEnum.SHORT_BREAK]: 0.1,
    [SessionStatusEnum.LONG_BREAK]: 15,
  },
  autoStartSession: true,
  autoStartBreak: true,
  tiresSettings: {
    [TireTypeEnum.SOFT]: {
      compound: "Soft",
      duration: 0.1,
    },
    [TireTypeEnum.MEDIUM]: {
      compound: "Medium",
      duration: 20,
    },
    [TireTypeEnum.HARD]: {
      compound: "Hard",
      duration: 25,
    },
    [TireTypeEnum.INTERMEDIATE]: {
      compound: "Intermediate",
      duration: 30,
    },
    [TireTypeEnum.WET]: {
      compound: "Wet",
      duration: 35,
    }
  },
  autoCompleteTask: true,
  autoOrderTasks: true,
  autoStartNextTask: true,
}