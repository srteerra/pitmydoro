import { SessionStatusEnum } from '@/enums/SessionStatus.enum';
import { PomodoroMode } from '@/interfaces/Settings.interface';
import { FlagEnum } from '@/enums/Flag.enum';
import { Locale } from '@/i18n/config';

export interface OverlayConfig {
  showSprite: boolean;
  showTimer: boolean;
  showTask: boolean;
  showFlag: boolean;
  spriteScale: number;
  timerScale: number;
  taskScale: number;
  align: 'top' | 'center' | 'bottom';
  timerColor: 'auto' | 'white' | 'black';
  fontStyle: 'neutral' | 'pixel';
  locale: Locale;
}

export interface OverlayScuderia {
  id: string;
  sprite: string;
}

export interface OverlayTimerState {
  isActive: boolean;
  status: SessionStatusEnum;
  endsAt: number | null;
  remainingMs: number;
  scuderia: OverlayScuderia | null;
  taskTitle: string | null;
  flag: FlagEnum | null;
  mode: PomodoroMode;
}

export interface OverlayDoc extends OverlayTimerState {
  config: OverlayConfig;
}

export interface OverlaySettings {
  token: string;
  enabled: boolean;
}
