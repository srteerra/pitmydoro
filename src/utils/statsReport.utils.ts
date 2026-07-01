import moment from 'moment';
import { DailyStats } from '@/interfaces/Stats.interface';

export type ReportPeriod = 'day' | 'week' | 'month' | 'year';

export interface ReportTotals {
  workTime: number;
  breakTime: number;
  pausedTime: number;
  pomodoros: number;
}

export interface TrendPoint {
  label: string;
  workTime: number;
  breakTime: number;
  pomodoros: number;
}

export interface HeatmapCell {
  key: string;
  date: Date;
  count: number;
  level: number;
  future: boolean;
}

const emptyTotals = (): ReportTotals => ({
  workTime: 0,
  breakTime: 0,
  pausedTime: 0,
  pomodoros: 0,
});

export const indexByDate = (items: DailyStats[]): Map<string, DailyStats> =>
  new Map(items.map((item) => [item.date, item]));

export const periodRange = (period: ReportPeriod): { from: string; to: string } => {
  const unit = period === 'week' ? 'isoWeek' : period;
  return {
    from: moment().startOf(unit).format('YYYY-MM-DD'),
    to: moment().endOf('day').format('YYYY-MM-DD'),
  };
};

export const fetchRange = (): { from: string; to: string } => ({
  from: moment().subtract(364, 'days').startOf('week').format('YYYY-MM-DD'),
  to: moment().endOf('day').format('YYYY-MM-DD'),
});

export const sumTotals = (items: DailyStats[], from: string, to: string): ReportTotals =>
  items
    .filter((item) => item.date >= from && item.date <= to)
    .reduce<ReportTotals>(
      (acc, item) => ({
        workTime: acc.workTime + (item.workTime ?? 0),
        breakTime: acc.breakTime + (item.breakTime ?? 0),
        pausedTime: acc.pausedTime + (item.pausedTime ?? 0),
        pomodoros: acc.pomodoros + (item.pomodoros ?? 0),
      }),
      emptyTotals()
    );

export const buildTrend = (items: DailyStats[], period: ReportPeriod): TrendPoint[] => {
  const byDate = indexByDate(items);

  if (period === 'year') {
    const start = moment().startOf('year');
    const months: TrendPoint[] = [];
    const cursor = moment(start);

    while (cursor.isSameOrBefore(moment(), 'month')) {
      const monthKey = cursor.format('YYYY-MM');
      const point = items
        .filter((item) => item.date.startsWith(monthKey))
        .reduce(
          (acc, item) => ({
            workTime: acc.workTime + (item.workTime ?? 0),
            breakTime: acc.breakTime + (item.breakTime ?? 0),
            pomodoros: acc.pomodoros + (item.pomodoros ?? 0),
          }),
          { workTime: 0, breakTime: 0, pomodoros: 0 }
        );

      months.push({ label: cursor.format('MMM'), ...point });
      cursor.add(1, 'month');
    }

    return months;
  }

  const { from, to } = periodRange(period);
  const points: TrendPoint[] = [];
  const cursor = moment(from);
  const end = moment(to);

  while (cursor.isSameOrBefore(end, 'day')) {
    const key = cursor.format('YYYY-MM-DD');
    const item = byDate.get(key);
    points.push({
      label: cursor.format('ddd D'),
      workTime: item?.workTime ?? 0,
      breakTime: item?.breakTime ?? 0,
      pomodoros: item?.pomodoros ?? 0,
    });
    cursor.add(1, 'day');
  }

  return points;
};

const cellLevel = (count: number): number => {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 6) return 3;
  return 4;
};

export const buildHeatmap = (items: DailyStats[]): HeatmapCell[][] => {
  const byDate = indexByDate(items);
  const end = moment().endOf('day');
  const start = moment(end).subtract(364, 'days').startOf('week');

  const weeks: HeatmapCell[][] = [];
  const cursor = moment(start);

  while (cursor.isSameOrBefore(end, 'day')) {
    const week: HeatmapCell[] = [];

    for (let day = 0; day < 7; day++) {
      const key = cursor.format('YYYY-MM-DD');
      const future = cursor.isAfter(end, 'day');
      const count = byDate.get(key)?.pomodoros ?? 0;

      week.push({
        key,
        date: cursor.toDate(),
        count,
        level: cellLevel(count),
        future,
      });

      cursor.add(1, 'day');
    }

    weeks.push(week);
  }

  return weeks;
};
