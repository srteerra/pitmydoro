import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';
import { aggregate, rank } from './aggregate';
import { rankConstructors } from './constructors';
import { loadProfiles } from './profiles';
import {
  monthRange,
  PeriodRange,
  previousMonthRange,
  previousWeekRange,
  weekRange,
} from './periods';
import {
  buildSnapshot,
  isSealed,
  LeaderboardSnapshot,
  publishCurrent,
  publishSnapshot,
} from './publish';

const SEAL_GRACE_MS = 36 * 60 * 60 * 1000;

const computeSnapshots = async (
  ranges: PeriodRange[],
  sealed: boolean
): Promise<LeaderboardSnapshot[]> => {
  const buckets = await aggregate(ranges);
  const profiles = await loadProfiles(buckets.flatMap((bucket) => [...bucket.totals.keys()]));

  return buckets.map((bucket) =>
    buildSnapshot(
      bucket.range,
      {
        ...rank(bucket.totals, profiles),
        constructors: rankConstructors(bucket.totals, profiles),
      },
      sealed
    )
  );
};

const sealIfDue = async (range: PeriodRange, nowMs: number): Promise<void> => {
  if (nowMs < range.endsAt + SEAL_GRACE_MS) return;
  if (await isSealed(range.id)) return;

  const [snapshot] = await computeSnapshots([range], true);
  await publishSnapshot(snapshot);

  logger.info('leaderboard sealed', {
    periodId: snapshot.periodId,
    participants: snapshot.participants,
  });
};

export const runLeaderboardRefresh = async (now: number = Date.now()): Promise<void> => {
  const [weekly, monthly] = await computeSnapshots([weekRange(now), monthRange(now)], false);

  await publishSnapshot(weekly);
  await publishSnapshot(monthly);
  await publishCurrent(weekly, monthly);

  logger.info('leaderboards refreshed', {
    weekly: { periodId: weekly.periodId, participants: weekly.participants },
    monthly: { periodId: monthly.periodId, participants: monthly.participants },
  });

  await sealIfDue(previousWeekRange(now), now);
  await sealIfDue(previousMonthRange(now), now);
};

export const refreshLeaderboards = onSchedule(
  {
    schedule: '0 0 * * *',
    timeZone: 'Etc/UTC',
    region: 'us-central1',
    timeoutSeconds: 540,
    memory: '512MiB',
    retryCount: 0,
  },
  async () => runLeaderboardRefresh()
);
