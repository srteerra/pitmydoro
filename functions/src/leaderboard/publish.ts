import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { PeriodRange, PeriodType } from './periods';
import { RankedEntry } from './aggregate';

export const SNAPSHOT_VERSION = 1;

export interface LeaderboardSnapshot {
  periodId: string;
  type: PeriodType;
  from: string;
  to: string;
  metric: 'workTime';
  top: RankedEntry[];
  participants: number;
  sealed: boolean;
  computedAt: Timestamp;
  version: number;
}

export const buildSnapshot = (
  range: PeriodRange,
  top: RankedEntry[],
  participants: number,
  sealed: boolean
): LeaderboardSnapshot => ({
  periodId: range.id,
  type: range.type,
  from: range.from,
  to: range.to,
  metric: 'workTime',
  top,
  participants,
  sealed,
  computedAt: Timestamp.now(),
  version: SNAPSHOT_VERSION,
});

export const publishSnapshot = async (snapshot: LeaderboardSnapshot): Promise<void> => {
  await getFirestore().collection('leaderboards').doc(snapshot.periodId).set(snapshot);
};

export const publishCurrent = async (
  weekly: LeaderboardSnapshot,
  monthly: LeaderboardSnapshot
): Promise<void> => {
  await getFirestore()
    .collection('leaderboards')
    .doc('_current')
    .set({ weekly, monthly, computedAt: Timestamp.now(), version: SNAPSHOT_VERSION });
};

export const isSealed = async (periodId: string): Promise<boolean> => {
  const snap = await getFirestore().collection('leaderboards').doc(periodId).get();
  return snap.exists && snap.get('sealed') === true;
};
