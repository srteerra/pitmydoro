import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { MAX_DAILY_POMODORO_SECONDS } from '@/constants/Social';
import { LeaderboardEntry } from '@/interfaces/Leaderboard.interface';
import { UserProfile } from '@/interfaces/UserProfile.interface';
import { userService } from '@/services/user.service';
import { isWithinRange, PeriodRange, unionRange } from '@/utils/leaderboardPeriods.utils';

export type PeriodTotals = Map<PeriodRange['type'], number>;

const cappedDailySeconds = (value: unknown): number => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return 0;
  return Math.min(value, MAX_DAILY_POMODORO_SECONDS);
};

const getUserTotals = async (userId: string, ranges: PeriodRange[]): Promise<PeriodTotals> => {
  const { from, to } = unionRange(ranges);
  const statsQuery = query(
    collection(db, 'profiles', userId, 'dailyStats'),
    where('date', '>=', from),
    where('date', '<=', to)
  );
  const snapshot = await getDocs(statsQuery);
  const totals: PeriodTotals = new Map(ranges.map((range) => [range.type, 0]));

  snapshot.docs.forEach((snap) => {
    const { date } = snap.data();
    const seconds = cappedDailySeconds(snap.data().pomodoroTime);
    if (typeof date !== 'string' || seconds === 0) return;

    ranges
      .filter((range) => isWithinRange(date, range))
      .forEach((range) => totals.set(range.type, (totals.get(range.type) ?? 0) + seconds));
  });

  return totals;
};

export interface FriendStanding {
  profile: UserProfile;
  totals: PeriodTotals;
}

export const toLeaderboardEntries = (
  standings: FriendStanding[],
  period: PeriodRange['type']
): LeaderboardEntry[] =>
  standings
    .map(({ profile, totals }) => ({
      rank: 0,
      uid: profile.uid as string,
      username: profile.username,
      displayName: profile.displayName || profile.username,
      photoURL: profile.photoURL ?? null,
      favoriteFlag: profile.favoriteFlag ?? null,
      badges: profile.badges ?? null,
      featuredBadge: profile.featuredBadge ?? null,
      pomodoroTime: totals.get(period) ?? 0,
    }))
    .sort((a, b) => b.pomodoroTime - a.pomodoroTime || a.username.localeCompare(b.username))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

export const friendsLeaderboardService = {
  async getStandings(userIds: string[], ranges: PeriodRange[]): Promise<FriendStanding[]> {
    const standings = await Promise.all(
      userIds.map(async (userId) => {
        const [profile, totals] = await Promise.all([
          userService.getProfile(userId),
          getUserTotals(userId, ranges),
        ]);
        return profile?.username ? { profile, totals } : null;
      })
    );

    return standings.filter((standing): standing is FriendStanding => standing !== null);
  },
};
