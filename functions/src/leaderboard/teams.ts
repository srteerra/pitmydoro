export const TEAM_IDS = [
  'red_bull_racing',
  'aston_martin',
  'haas',
  'williams',
  'racing_bulls',
  'mclaren',
  'mercedes',
  'ferrari',
  'alpine',
  'sauber',
] as const;

export type TeamId = (typeof TEAM_IDS)[number];

export const isTeamId = (value: unknown): value is TeamId =>
  typeof value === 'string' && (TEAM_IDS as readonly string[]).includes(value);
