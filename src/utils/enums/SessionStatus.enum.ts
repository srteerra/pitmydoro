export enum SessionStatusEnum {
  IN_SESSION = 'session',
  SHORT_BREAK = 'shortBreak',
  LONG_BREAK = 'longBreak',
}

export const SessionStatusEnumLabel = {
  [SessionStatusEnum.IN_SESSION]: 'Session',
  [SessionStatusEnum.SHORT_BREAK]: 'Short Break',
  [SessionStatusEnum.LONG_BREAK]: 'Long Break',
};
