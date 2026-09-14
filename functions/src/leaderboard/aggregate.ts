import { getFirestore, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { PeriodRange, unionRange } from './periods';

export const MAX_DAILY_POMODORO_SECONDS = 57_600;

export const TOP_SIZE = 50;

export interface RankedEntry {
  rank: number;
  uid: string;
  username: string;
  displayName: string;
  photoURL: string | null;
  favoriteFlag: string | null;
  pomodoroTime: number;
}

export interface PeriodTotals {
  range: PeriodRange;
  totals: Map<string, number>;
}

export const aggregate = async (ranges: PeriodRange[]): Promise<PeriodTotals[]> => {
  const buckets: PeriodTotals[] = ranges.map((range) => ({
    range,
    totals: new Map<string, number>(),
  }));

  const { from, to } = unionRange(ranges);

  const stream = getFirestore()
    .collectionGroup('dailyStats')
    .where('utcDate', '>=', from)
    .where('utcDate', '<=', to)
    .stream();

  for await (const chunk of stream) {
    const doc = chunk as unknown as QueryDocumentSnapshot;
    const uid = doc.ref.parent.parent?.id;
    if (!uid) continue;

    const date = doc.get('utcDate');
    if (typeof date !== 'string') continue;

    const pomodoroTime = doc.get('pomodoroTime');
    if (typeof pomodoroTime !== 'number' || !Number.isFinite(pomodoroTime)) continue;
    if (pomodoroTime <= 0 || pomodoroTime > MAX_DAILY_POMODORO_SECONDS) continue;

    for (const bucket of buckets) {
      if (date < bucket.range.from || date > bucket.range.to) continue;
      bucket.totals.set(uid, (bucket.totals.get(uid) ?? 0) + pomodoroTime);
    }
  }

  return buckets;
};

export const rank = async (
  totals: Map<string, number>,
  limit: number = TOP_SIZE
): Promise<{ top: RankedEntry[]; participants: number }> => {
  const sorted = [...totals.entries()]
    .filter(([, pomodoroTime]) => pomodoroTime > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  const participants = sorted.length;
  if (participants === 0) return { top: [], participants };

  const db = getFirestore();
  const candidates = sorted.slice(0, limit * 2);
  const snaps = await db.getAll(...candidates.map(([uid]) => db.collection('profiles').doc(uid)));
  const profiles = new Map(snaps.map((snap) => [snap.id, snap]));

  const top: RankedEntry[] = [];

  for (const [uid, pomodoroTime] of candidates) {
    if (top.length >= limit) break;

    const profile = profiles.get(uid);
    if (!profile?.exists) continue;

    const username = profile.get('username');
    if (typeof username !== 'string' || username.length === 0) continue;

    const displayName = profile.get('displayName');
    const photoURL = profile.get('photoURL');
    const favoriteFlag = profile.get('favoriteFlag');

    top.push({
      rank: top.length + 1,
      uid,
      username,
      displayName:
        typeof displayName === 'string' && displayName.length > 0 ? displayName : username,
      photoURL: typeof photoURL === 'string' && photoURL.length > 0 ? photoURL : null,
      favoriteFlag:
        typeof favoriteFlag === 'string' && favoriteFlag.length > 0 ? favoriteFlag : null,
      pomodoroTime,
    });
  }

  return { top, participants };
};
