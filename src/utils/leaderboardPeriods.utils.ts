import moment from 'moment';
import { LeaderboardPeriodType } from '@/interfaces/Leaderboard.interface';

const DATE_FORMAT = 'YYYY-MM-DD';

export interface PeriodRange {
  type: LeaderboardPeriodType;
  from: string;
  to: string;
}

const localRange = (type: LeaderboardPeriodType, unit: 'isoWeek' | 'month'): PeriodRange => ({
  type,
  from: moment().startOf(unit).format(DATE_FORMAT),
  to: moment().endOf(unit).format(DATE_FORMAT),
});

export const weekRange = (): PeriodRange => localRange('weekly', 'isoWeek');

export const monthRange = (): PeriodRange => localRange('monthly', 'month');

export const unionRange = (ranges: PeriodRange[]): { from: string; to: string } => ({
  from: ranges.map((range) => range.from).sort()[0],
  to: ranges
    .map((range) => range.to)
    .sort()
    .reverse()[0],
});

export const isWithinRange = (date: string, range: PeriodRange): boolean =>
  date >= range.from && date <= range.to;
