import moment from 'moment';
import { DailyStats } from '@/interfaces/Stats.interface';

export type ReportPeriod = 'day' | 'week' | 'month' | 'year';

export interface ReportTotals {
  workTime: number;
  breakTime: number;
  pausedTime: number;
  pomodoros: number;
}

const emptyTotals = (): ReportTotals => ({
  workTime: 0,
  breakTime: 0,
  pausedTime: 0,
  pomodoros: 0,
});

export const periodRange = (period: ReportPeriod): { from: string; to: string } => {
  const unit = period === 'week' ? 'isoWeek' : period;
  return {
    from: moment().startOf(unit).format('YYYY-MM-DD'),
    to: moment().endOf('day').format('YYYY-MM-DD'),
  };
};

export const fetchRange = (): { from: string; to: string } => ({
  from: moment().startOf('year').format('YYYY-MM-DD'),
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
