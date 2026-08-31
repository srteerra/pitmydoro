import { UserStreak } from '@/interfaces/UserStreak.interface';

const MS_PER_DAY = 86_400_000;

export const EMPTY_STREAK: UserStreak = { current: 0, longest: 0, lastDay: '' };

export const localDayKey = (date: Date | number = Date.now()): string => {
  const value = date instanceof Date ? date : new Date(date);
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');
  return `${value.getFullYear()}-${month}-${day}`;
};

const dayIndex = (key: string): number | null => {
  const [year, month, day] = (key || '').split('-').map(Number);
  if (!year || !month || !day) return null;
  return Math.floor(Date.UTC(year, month - 1, day) / MS_PER_DAY);
};

export const daysBetween = (from: string, to: string): number | null => {
  const start = dayIndex(from);
  const end = dayIndex(to);
  return start === null || end === null ? null : end - start;
};

export const advanceStreak = (streak: UserStreak, today: string): UserStreak | null => {
  const gap = daysBetween(streak.lastDay, today);

  if (gap !== null && gap <= 0) return null;

  const current = gap === 1 ? (streak.current || 0) + 1 : 1;

  return { current, longest: Math.max(streak.longest || 0, current), lastDay: today };
};

export const resolveStreak = (streak: UserStreak | undefined, today: string): UserStreak => {
  if (!streak?.lastDay) return EMPTY_STREAK;

  const gap = daysBetween(streak.lastDay, today);
  if (gap === null || gap > 1) return { ...streak, current: 0 };

  return streak;
};

export const isStreakActiveToday = (streak: UserStreak | undefined, today: string): boolean =>
  !!streak?.lastDay && daysBetween(streak.lastDay, today) === 0;
