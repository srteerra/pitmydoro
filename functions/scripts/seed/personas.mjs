export const PERSONAS = {
  grinder: { activeRate: 0.85, weekendFactor: 0.75, pomodoros: [5, 12], ageDays: [120, 420] },
  regular: { activeRate: 0.65, weekendFactor: 0.5, pomodoros: [3, 7], ageDays: [60, 400] },
  casual: { activeRate: 0.35, weekendFactor: 0.6, pomodoros: [1, 4], ageDays: [30, 380] },
  weekender: { activeRate: 0.2, weekendFactor: 4, pomodoros: [2, 6], ageDays: [45, 300] },
  newbie: { activeRate: 0.7, weekendFactor: 0.6, pomodoros: [2, 5], ageDays: [5, 20] },
  dormant: { activeRate: 0.6, weekendFactor: 0.5, pomodoros: [2, 6], ageDays: [150, 420] },
};

export const PERSONA_WEIGHTS = [
  ['grinder', 6],
  ['regular', 14],
  ['casual', 12],
  ['weekender', 5],
  ['newbie', 6],
  ['dormant', 5],
];

export const POMODORO_LENGTHS = [
  [1500, 6],
  [3000, 2],
  [3600, 1],
];
