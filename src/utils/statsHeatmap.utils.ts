import moment from 'moment';
import { DailyStats } from '@/interfaces/Stats.interface';

export const HEATMAP_LEVELS = 4;

export interface HeatmapCell {
  date: string;
  pomodoros: number;
  pomodoroTime: number;
  level: number;
  isFuture: boolean;
}

export interface HeatmapWeek {
  key: string;
  days: HeatmapCell[];
}

export interface Heatmap {
  weeks: HeatmapWeek[];
  months: { key: string; label: string; weekIndex: number }[];
  total: number;
  bestDay: number;
}

const levelFor = (pomodoros: number, max: number): number => {
  if (pomodoros <= 0 || max <= 0) return 0;
  return Math.min(HEATMAP_LEVELS, Math.max(1, Math.ceil((pomodoros / max) * HEATMAP_LEVELS)));
};

export const buildHeatmap = (items: DailyStats[], from: string, to: string): Heatmap => {
  const byDate = new Map(items.map((item) => [item.date, item]));

  const start = moment(from, 'YYYY-MM-DD').startOf('isoWeek');
  const end = moment(to, 'YYYY-MM-DD').endOf('isoWeek');
  const today = moment().endOf('day');

  const max = items.reduce((acc, item) => Math.max(acc, item.pomodoros ?? 0), 0);

  const weeks: HeatmapWeek[] = [];
  const months: Heatmap['months'] = [];
  let total = 0;

  const cursor = start.clone();

  while (cursor.isSameOrBefore(end)) {
    const days: HeatmapCell[] = [];

    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      const day = cursor.clone().add(dayIndex, 'days');
      const date = day.format('YYYY-MM-DD');
      const stats = byDate.get(date);
      const pomodoros = stats?.pomodoros ?? 0;

      total += pomodoros;

      days.push({
        date,
        pomodoros,
        pomodoroTime: stats?.pomodoroTime ?? 0,
        level: levelFor(pomodoros, max),
        isFuture: day.isAfter(today),
      });
    }

    const monthKey = days[0].date.slice(0, 7);

    if (months[months.length - 1]?.key !== monthKey) {
      months.push({
        key: monthKey,
        label: moment(monthKey, 'YYYY-MM').format('MMM'),
        weekIndex: weeks.length,
      });
    }

    weeks.push({ key: days[0].date, days });
    cursor.add(1, 'week');
  }

  return { weeks, months, total, bestDay: max };
};
