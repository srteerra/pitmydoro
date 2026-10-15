import { Timestamp } from 'firebase-admin/firestore';
import { PERSONAS } from './personas.mjs';

export const MS_PER_DAY = 86_400_000;
const MS_PER_HOUR = 3_600_000;
const SHORT_BREAK_SECONDS = 300;
const LONG_BREAK_SECONDS = 900;
const POMODOROS_PER_LONG_BREAK = 4;
const MAX_DAILY_RATE = 0.95;
const TODAY_RATE_FACTOR = 0.6;
const DEFAULT_SPRITE = 'red_bull_racing';

export const dayKey = (ms) => new Date(ms).toISOString().slice(0, 10);

const isWeekend = (ms) => [0, 6].includes(new Date(ms).getUTCDay());

const dailyRate = (persona, ms, isToday) => {
  const rate = persona.activeRate * (isWeekend(ms) ? persona.weekendFactor : 1);
  return Math.min(rate, MAX_DAILY_RATE) * (isToday ? TODAY_RATE_FACTOR : 1);
};

const buildDay = (random, ms, { persona, pomodoroLength, teamId }) => {
  const pomodoros = random.int(...persona.pomodoros);
  const pomodoroTime = pomodoros * pomodoroLength;
  const workTime = pomodoroTime + random.int(0, 240);
  const breakTime =
    pomodoros * SHORT_BREAK_SECONDS +
    Math.floor(pomodoros / POMODOROS_PER_LONG_BREAK) * LONG_BREAK_SECONDS;
  const date = dayKey(ms);

  return {
    date,
    utcDate: date,
    pomodoros,
    pomodoroTime,
    workTime,
    breakTime,
    pausedTime: random.chance(0.4) ? random.int(30, 900) : 0,
    pauses: random.int(0, 3),
    interruptions: random.int(0, 2),
    tasksCreated: random.int(0, 4),
    tasksCompleted: random.int(0, Math.min(3, pomodoros)),
    sprites: { [teamId ?? DEFAULT_SPRITE]: workTime + breakTime },
    updatedAt: Timestamp.fromMillis(ms + random.int(8, 22) * MS_PER_HOUR),
  };
};

export const buildActivity = (random, { personaId, pomodoroLength, teamId }, now) => {
  const persona = PERSONAS[personaId];
  const ageDays = random.int(...persona.ageDays);
  const stopDaysAgo = personaId === 'dormant' ? random.int(30, 90) : 0;
  const today = Math.floor(now / MS_PER_DAY) * MS_PER_DAY;
  const days = [];

  for (let offset = ageDays; offset >= stopDaysAgo; offset--) {
    const ms = today - offset * MS_PER_DAY;
    if (!random.chance(dailyRate(persona, ms, offset === 0))) continue;
    days.push(buildDay(random, ms, { persona, pomodoroLength, teamId }));
  }

  return { createdAt: today - ageDays * MS_PER_DAY, days };
};

const longestRun = (indexes) =>
  indexes.reduce(
    (acc, index, position) => {
      const run = position > 0 && index === indexes[position - 1] + 1 ? acc.run + 1 : 1;
      return { run, longest: Math.max(acc.longest, run) };
    },
    { run: 0, longest: 0 }
  ).longest;

export const buildStreak = (days, now) => {
  if (days.length === 0) return { current: 0, longest: 0, lastDay: '' };

  const indexes = days.map((day) => Math.floor(Date.parse(day.date) / MS_PER_DAY));
  const todayIndex = Math.floor(now / MS_PER_DAY);
  const lastIndex = indexes[indexes.length - 1];
  let current = 0;

  if (todayIndex - lastIndex <= 1) {
    for (let position = indexes.length - 1; position >= 0; position--) {
      if (indexes[position] !== lastIndex - current) break;
      current++;
    }
  }

  return { current, longest: longestRun(indexes), lastDay: days[days.length - 1].date };
};
