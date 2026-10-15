import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { clearFirestore, db, seedDay, seedProfile } from './emulator.mjs';
import { runLeaderboardRefresh } from '../lib/leaderboard/index.js';
import {
  aggregate,
  cappedDailySeconds,
  MAX_DAILY_POMODORO_SECONDS,
} from '../lib/leaderboard/aggregate.js';
import { weekRange } from '../lib/leaderboard/periods.js';

const NOW = Date.UTC(2026, 9, 7, 12);
const WEEK_ID = '2026-W41';
const MONTH_ID = '2026-10';

const PROFILES = {
  west: { username: 'west', displayName: 'West', favoriteTeam: 'ferrari' },
  east: { username: 'east', displayName: 'East', favoriteTeam: 'ferrari' },
  legacy: { username: 'legacy', displayName: 'Legacy', favoriteTeam: 'mclaren' },
  grinder: { username: 'grinder', displayName: 'Grinder', favoriteTeam: 'mercedes' },
  noteam: { username: 'noteam', displayName: 'No Team', favoriteTeam: null },
  unknownteam: { username: 'unknownteam', displayName: 'Unknown', favoriteTeam: 'brabham' },
  nousername: { displayName: 'Ghost', favoriteTeam: 'mclaren' },
};

const DAYS = [
  ['west', '2026-10-06', { utcDate: '2026-10-06', pomodoroTime: 1800 }],
  ['west', '2026-10-11', { utcDate: '2026-10-12', pomodoroTime: 3600 }],
  ['east', '2026-10-05', { utcDate: '2026-10-04', pomodoroTime: 3600 }],
  ['east', '2026-10-04', { utcDate: '2026-10-05', pomodoroTime: 1500 }],
  ['legacy', '2026-10-07', { pomodoroTime: 1500 }],
  ['grinder', '2026-10-06', { utcDate: '2026-10-06', pomodoroTime: 70_000 }],
  ['grinder', '2026-10-07', { utcDate: '2026-10-07', pomodoroTime: -50 }],
  ['grinder', '2026-10-08', { utcDate: '2026-10-08', pomodoroTime: '900' }],
  ['noteam', '2026-10-06', { utcDate: '2026-10-06', pomodoroTime: 600 }],
  ['unknownteam', '2026-10-06', { utcDate: '2026-10-06', pomodoroTime: 700 }],
  ['nousername', '2026-10-06', { utcDate: '2026-10-06', pomodoroTime: 300 }],
  ['west', '2026-09-30', { utcDate: '2026-09-30', pomodoroTime: 9999 }],
];

const profileWeekTotal = (uid) => {
  const { from, to } = weekRange(NOW);
  return DAYS.filter(([owner, date]) => owner === uid && date >= from && date <= to).reduce(
    (sum, [, , data]) => sum + cappedDailySeconds(data.pomodoroTime),
    0
  );
};

const readSnapshot = async (docId) =>
  (await db().collection('leaderboards').doc(docId).get()).data();

const secondsByUser = (snapshot) =>
  Object.fromEntries(snapshot.top.map((entry) => [entry.uid, entry.pomodoroTime]));

describe('leaderboard refresh', () => {
  let weekly;
  let monthly;

  before(async () => {
    await clearFirestore();
    await Promise.all(Object.entries(PROFILES).map(([uid, profile]) => seedProfile(uid, profile)));
    await Promise.all(DAYS.map(([uid, date, data]) => seedDay(uid, date, data)));
    await runLeaderboardRefresh(NOW);
    weekly = await readSnapshot(WEEK_ID);
    monthly = await readSnapshot(MONTH_ID);
  });

  after(clearFirestore);

  test('attributes each day by its local date even when utcDate drifted', () => {
    const totals = secondsByUser(weekly);
    assert.equal(totals.west, 5400);
    assert.equal(totals.east, 3600);
  });

  test('counts legacy days without utcDate', () => {
    assert.equal(secondsByUser(weekly).legacy, 1500);
  });

  test('caps oversized days instead of dropping them and ignores invalid values', () => {
    assert.equal(secondsByUser(weekly).grinder, MAX_DAILY_POMODORO_SECONDS);
  });

  test('weekly totals match what the profile shows for the same week', () => {
    for (const entry of weekly.top) {
      assert.equal(entry.pomodoroTime, profileWeekTotal(entry.uid), entry.uid);
    }
  });

  test('monthly totals include days outside the week but inside the month', () => {
    const totals = secondsByUser(monthly);
    assert.equal(totals.east, 5100);
    assert.equal(totals.west, 5400);
  });

  test('skips profiles without username from the users ranking', () => {
    assert.ok(!weekly.top.some((entry) => entry.uid === 'nousername'));
    assert.equal(weekly.participants, 7);
  });

  test('ranks users by focus time', () => {
    assert.deepEqual(
      weekly.top.map((entry) => entry.uid),
      ['grinder', 'west', 'east', 'legacy', 'unknownteam', 'noteam']
    );
  });

  test('sums constructors by favorite team and counts drivers', () => {
    assert.deepEqual(weekly.constructors, [
      { rank: 1, teamId: 'mercedes', pomodoroTime: MAX_DAILY_POMODORO_SECONDS, drivers: 1 },
      { rank: 2, teamId: 'ferrari', pomodoroTime: 9000, drivers: 2 },
      { rank: 3, teamId: 'mclaren', pomodoroTime: 1800, drivers: 2 },
    ]);
  });

  test('publishes current snapshot with constructors', async () => {
    const current = await readSnapshot('_current');
    assert.equal(current.version, 4);
    assert.equal(current.weekly.periodId, WEEK_ID);
    assert.equal(current.monthly.periodId, MONTH_ID);
    assert.equal(current.weekly.constructors.length, 3);
  });
});

describe('aggregate', () => {
  before(clearFirestore);
  after(clearFirestore);

  test('ignores dailyStats outside profiles', async () => {
    await db().collection('users').doc('intruder').collection('dailyStats').doc('2026-10-06').set({
      date: '2026-10-06',
      pomodoroTime: 3600,
    });
    const [bucket] = await aggregate([weekRange(NOW)]);
    assert.equal(bucket.totals.size, 0);
  });
});
