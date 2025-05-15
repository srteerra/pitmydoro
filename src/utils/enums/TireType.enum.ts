export enum TireTypeEnum {
  SOFT,
  MEDIUM,
  HARD,
  INTERMEDIATE,
  WET,
}

export const TireTypeEnumLabel = {
  [TireTypeEnum.SOFT]: 'Soft',
  [TireTypeEnum.MEDIUM]: 'Medium',
  [TireTypeEnum.HARD]: 'Hard',
  [TireTypeEnum.INTERMEDIATE]: 'Intermediate',
  [TireTypeEnum.WET]: 'Wet',
};

export const TireTypeEnumLabelToContext = {
  [TireTypeEnum.SOFT]: 'Soft Pomodoro',
  [TireTypeEnum.MEDIUM]: 'Medium Pomodoro',
  [TireTypeEnum.HARD]: 'Hard Pomodoro',
  [TireTypeEnum.INTERMEDIATE]: 'Intensive Pomodoro',
  [TireTypeEnum.WET]: 'Chill Pomodoro',
};
