import { expect, test } from '@playwright/test';
import {
  advanceStreak,
  daysBetween,
  EMPTY_STREAK,
  isStreakActiveToday,
  localDayKey,
  resolveStreak,
} from '@/utils/streak.utils';

test.describe('Streak day keys', () => {
  test('builds a zero padded local day key', () => {
    expect(localDayKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(localDayKey(new Date(2026, 11, 31))).toBe('2026-12-31');
  });

  test('uses the local calendar day, not the utc one', () => {
    const lateNight = new Date(2026, 7, 31, 23, 30);

    expect(localDayKey(lateNight)).toBe('2026-08-31');
  });

  test('counts whole days between two keys', () => {
    expect(daysBetween('2026-08-30', '2026-08-31')).toBe(1);
    expect(daysBetween('2026-08-31', '2026-08-31')).toBe(0);
    expect(daysBetween('2026-08-31', '2026-08-28')).toBe(-3);
    expect(daysBetween('2026-02-28', '2026-03-01')).toBe(1);
  });

  test('returns null for malformed keys', () => {
    expect(daysBetween('', '2026-08-31')).toBeNull();
    expect(daysBetween('not-a-day', '2026-08-31')).toBeNull();
    expect(daysBetween('2026-08-31', '')).toBeNull();
  });
});

test.describe('Advancing a streak', () => {
  test('starts at one when there is no history', () => {
    expect(advanceStreak(EMPTY_STREAK, '2026-08-31')).toEqual({
      current: 1,
      longest: 1,
      lastDay: '2026-08-31',
    });
  });

  test('increments on a consecutive day', () => {
    expect(advanceStreak({ current: 3, longest: 5, lastDay: '2026-08-30' }, '2026-08-31')).toEqual({
      current: 4,
      longest: 5,
      lastDay: '2026-08-31',
    });
  });

  test('raises the longest streak when the current one beats it', () => {
    expect(advanceStreak({ current: 5, longest: 5, lastDay: '2026-08-30' }, '2026-08-31')).toEqual({
      current: 6,
      longest: 6,
      lastDay: '2026-08-31',
    });
  });

  test('does nothing when the day was already counted', () => {
    expect(
      advanceStreak({ current: 3, longest: 5, lastDay: '2026-08-31' }, '2026-08-31')
    ).toBeNull();
  });

  test('does nothing when the incoming day is in the past', () => {
    expect(
      advanceStreak({ current: 3, longest: 5, lastDay: '2026-08-31' }, '2026-08-29')
    ).toBeNull();
  });

  test('restarts at one after a missed day and keeps the record', () => {
    expect(advanceStreak({ current: 9, longest: 9, lastDay: '2026-08-25' }, '2026-08-31')).toEqual({
      current: 1,
      longest: 9,
      lastDay: '2026-08-31',
    });
  });

  test('restarts at one when the stored day is malformed', () => {
    expect(advanceStreak({ current: 4, longest: 4, lastDay: 'garbage' }, '2026-08-31')).toEqual({
      current: 1,
      longest: 4,
      lastDay: '2026-08-31',
    });
  });
});

test.describe('Resolving a streak for display', () => {
  test('falls back to an empty streak without history', () => {
    expect(resolveStreak(undefined, '2026-08-31')).toEqual(EMPTY_STREAK);
    expect(resolveStreak({ current: 4, longest: 4, lastDay: '' }, '2026-08-31')).toEqual(
      EMPTY_STREAK
    );
  });

  test('keeps the streak alive today and on the day after', () => {
    const streak = { current: 4, longest: 6, lastDay: '2026-08-31' };
    expect(resolveStreak(streak, '2026-08-31')).toEqual(streak);

    const yesterday = { current: 4, longest: 6, lastDay: '2026-08-30' };
    expect(resolveStreak(yesterday, '2026-08-31')).toEqual(yesterday);
  });

  test('zeroes the current streak once a day was missed but keeps the record', () => {
    expect(resolveStreak({ current: 4, longest: 6, lastDay: '2026-08-28' }, '2026-08-31')).toEqual({
      current: 0,
      longest: 6,
      lastDay: '2026-08-28',
    });
  });

  test('flags whether a session was already logged today', () => {
    expect(
      isStreakActiveToday({ current: 2, longest: 2, lastDay: '2026-08-31' }, '2026-08-31')
    ).toBe(true);
    expect(
      isStreakActiveToday({ current: 2, longest: 2, lastDay: '2026-08-30' }, '2026-08-31')
    ).toBe(false);
    expect(isStreakActiveToday(undefined, '2026-08-31')).toBe(false);
  });
});
