const MS_PER_DAY = 86_400_000;

export type PeriodType = 'weekly' | 'monthly';

export interface PeriodRange {
  id: string;
  type: PeriodType;
  from: string;
  to: string;
  endsAt: number;
}

const pad = (value: number): string => `${value}`.padStart(2, '0');

const dayKey = (ms: number): string => {
  const date = new Date(ms);
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
};

const utcMidnight = (ms: number): number => Math.floor(ms / MS_PER_DAY) * MS_PER_DAY;

const isoDayOfWeek = (ms: number): number => {
  const day = new Date(ms).getUTCDay();
  return day === 0 ? 7 : day;
};

const isoWeekStart = (ms: number): number => utcMidnight(ms) - (isoDayOfWeek(ms) - 1) * MS_PER_DAY;

export const weekRange = (nowMs: number): PeriodRange => {
  const start = isoWeekStart(nowMs);
  const end = start + 6 * MS_PER_DAY;
  const thursday = start + 3 * MS_PER_DAY;
  const year = new Date(thursday).getUTCFullYear();
  const week = Math.floor((thursday - Date.UTC(year, 0, 1)) / MS_PER_DAY / 7) + 1;

  return {
    id: `${year}-W${pad(week)}`,
    type: 'weekly',
    from: dayKey(start),
    to: dayKey(end),
    endsAt: end + MS_PER_DAY,
  };
};

export const monthRange = (nowMs: number): PeriodRange => {
  const date = new Date(nowMs);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const start = Date.UTC(year, month, 1);
  const nextStart = Date.UTC(year, month + 1, 1);

  return {
    id: `${year}-${pad(month + 1)}`,
    type: 'monthly',
    from: dayKey(start),
    to: dayKey(nextStart - MS_PER_DAY),
    endsAt: nextStart,
  };
};

export const previousWeekRange = (nowMs: number): PeriodRange =>
  weekRange(isoWeekStart(nowMs) - MS_PER_DAY);

export const previousMonthRange = (nowMs: number): PeriodRange => {
  const date = new Date(nowMs);
  return monthRange(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1) - MS_PER_DAY);
};

export const unionRange = (ranges: PeriodRange[]): { from: string; to: string } =>
  ranges.reduce(
    (acc, range) => ({
      from: range.from < acc.from ? range.from : acc.from,
      to: range.to > acc.to ? range.to : acc.to,
    }),
    { from: ranges[0].from, to: ranges[0].to }
  );
