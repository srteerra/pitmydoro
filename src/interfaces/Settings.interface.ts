import { TireTypeEnum } from '@/enums/TireType.enum';
import { SessionStatusEnum } from '@/enums/SessionStatus.enum';
import { Locale } from '@/i18n/config';
import { Team } from '@/interfaces/Teams.interface';

export interface TireSettings {
  compound: string;
  duration: number;
}

export interface Settings {
  locale: Locale;
  tiresSettings: Record<TireTypeEnum, TireSettings>;
  currentScuderia: Team;
  breaksInterval: number;
  breaksDuration: Record<SessionStatusEnum.SHORT_BREAK | SessionStatusEnum.LONG_BREAK, number>;
  autoStartSession: boolean;
  isLongBreakPerTask: boolean;
  autoStartBreak: boolean;
  autoCompleteTask: boolean;
  autoOrderTasks: boolean;
  autoStartNextTask: boolean;
  enableSounds: boolean;
  volume: number;
  enableNotifications: boolean;
}
