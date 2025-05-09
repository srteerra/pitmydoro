import { TireTypeEnum } from "@/utils/enums/TireType.enum";
import { SessionStatusEnum } from "@/utils/enums/SessionStatus.enum";

export interface TireSettings {
  compound: string;
  duration: number;
}

export interface ISettings {
  tiresSettings: Record<TireTypeEnum, TireSettings>,
  breaksInterval: number,
  breaksDuration: Record<SessionStatusEnum.SHORT_BREAK | SessionStatusEnum.LONG_BREAK, number>,
  autoStartSession: boolean,
  isLongBreakPerTask: boolean,
  autoStartBreak: boolean,
  autoCompleteTask: boolean,
  autoOrderTasks: boolean,
  autoStartNextTask: boolean,
}