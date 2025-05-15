import { TireTypeEnum } from '@/utils/enums/TireType.enum';
import { SessionStatusEnum } from '@/utils/enums/SessionStatus.enum';
import { ISettings } from '@/interfaces/Settings.interface';
import { defaultLocale } from '@/i18n/config';

export const DefaultSettings: ISettings = {
  locale: defaultLocale,
  breaksInterval: 2,
  isLongBreakPerTask: false,
  breaksDuration: {
    [SessionStatusEnum.SHORT_BREAK]: 15,
    [SessionStatusEnum.LONG_BREAK]: 15,
  },
  autoStartSession: true,
  autoStartBreak: true,
  tiresSettings: {
    [TireTypeEnum.SOFT]: {
      compound: 'Soft',
      duration: 15,
    },
    [TireTypeEnum.MEDIUM]: {
      compound: 'Medium',
      duration: 20,
    },
    [TireTypeEnum.HARD]: {
      compound: 'Hard',
      duration: 25,
    },
    [TireTypeEnum.INTERMEDIATE]: {
      compound: 'Intermediate',
      duration: 30,
    },
    [TireTypeEnum.WET]: {
      compound: 'Wet',
      duration: 35,
    },
  },
  autoCompleteTask: true,
  autoOrderTasks: true,
  autoStartNextTask: true,
  enableSounds: true,
  enableNotifications: true,
};
