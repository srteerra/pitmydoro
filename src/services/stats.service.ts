import {
  collection,
  doc,
  getDocs,
  increment,
  orderBy,
  query,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { localDayKey } from '@/utils/streak.utils';
import { DailyStats, DailyStatsDelta } from '@/interfaces/Stats.interface';
import { PomodoroMode } from '@/interfaces/Settings.interface';
import useSettingsStore from '@/stores/Settings.store';

export const dayKey = (date: Date | number = Date.now()) => localDayKey(date);

export const utcDayKey = (date: Date | number = Date.now()): string => {
  const value = date instanceof Date ? date : new Date(date);
  const month = `${value.getUTCMonth() + 1}`.padStart(2, '0');
  const day = `${value.getUTCDate()}`.padStart(2, '0');
  return `${value.getUTCFullYear()}-${month}-${day}`;
};

export const statsService = {
  async incrementDailyStats(
    userId: string,
    delta: DailyStatsDelta,
    date: Date | number = Date.now()
  ) {
    const updates: Record<string, unknown> = {};

    if (delta.workTime !== undefined) updates.workTime = increment(delta.workTime);
    if (delta.breakTime !== undefined) updates.breakTime = increment(delta.breakTime);
    if (delta.pausedTime !== undefined) updates.pausedTime = increment(delta.pausedTime);
    if (delta.pomodoros !== undefined) updates.pomodoros = increment(delta.pomodoros);
    if (delta.pauses !== undefined) updates.pauses = increment(delta.pauses);
    if (delta.interruptions !== undefined) updates.interruptions = increment(delta.interruptions);
    if (delta.tasksCreated !== undefined) updates.tasksCreated = increment(delta.tasksCreated);
    if (delta.tasksCompleted !== undefined)
      updates.tasksCompleted = increment(delta.tasksCompleted);

    const { mode, currentScuderia } = useSettingsStore.getState();
    const spriteSeconds = (delta.workTime ?? 0) + (delta.breakTime ?? 0);
    if (mode === PomodoroMode.F1 && spriteSeconds > 0) {
      const spriteId = currentScuderia?.id ?? 'unknown';
      updates.sprites = { [spriteId]: increment(spriteSeconds) };
    }

    if (Object.keys(updates).length === 0) return;

    const key = dayKey(date);
    updates.date = key;
    updates.utcDate = utcDayKey(date);
    updates.updatedAt = Timestamp.now();

    await setDoc(doc(db, 'profiles', userId, 'dailyStats', key), updates, { merge: true });
  },

  async getDailyStatsRange(userId: string, from: string, to: string): Promise<DailyStats[]> {
    const q = query(
      collection(db, 'profiles', userId, 'dailyStats'),
      where('date', '>=', from),
      where('date', '<=', to),
      orderBy('date', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as DailyStats);
  },
};
