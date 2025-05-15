import { TireTypeEnum } from '@/utils/enums/TireType.enum';
import { SessionStatusEnum } from '@/utils/enums/SessionStatus.enum';
import { Locale } from '@/i18n/config';

export interface TireSettings {
  compound: string;
  duration: number;
}

export interface ISettings {
  locale: Locale;
  tiresSettings: Record<TireTypeEnum, TireSettings>;
  breaksInterval: number;
  breaksDuration: Record<SessionStatusEnum.SHORT_BREAK | SessionStatusEnum.LONG_BREAK, number>;
  autoStartSession: boolean;
  isLongBreakPerTask: boolean;
  autoStartBreak: boolean;
  autoCompleteTask: boolean;
  autoOrderTasks: boolean;
  autoStartNextTask: boolean;
  enableSounds: boolean;
  enableNotifications: boolean;
}
