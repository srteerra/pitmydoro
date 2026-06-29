import { TaskStats } from '@/interfaces/Task.interface';

export const statSeconds = (value: number | null | undefined): number | null =>
  typeof value === 'number' && Number.isInteger(value) ? value : null;

export const hasDecimalStat = (stats: TaskStats | null | undefined): boolean => {
  if (!stats) return false;

  return [
    stats.totalWorkTime,
    stats.totalBreakTime,
    stats.totalPausedTime,
    stats.totalPauses,
    stats.totalInterruptions,
  ].some((value) => typeof value === 'number' && !Number.isInteger(value));
};
