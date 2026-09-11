import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { CurrentLeaderboards, LeaderboardSnapshot } from '@/interfaces/Leaderboard.interface';

const leaderboardRef = (docId: string) => doc(db, 'leaderboards', docId);

export const leaderboardService = {
  async getCurrent(): Promise<CurrentLeaderboards | null> {
    const snapshot = await getDoc(leaderboardRef('_current'));
    return snapshot.exists() ? (snapshot.data() as CurrentLeaderboards) : null;
  },

  async getByPeriod(periodId: string): Promise<LeaderboardSnapshot | null> {
    if (!periodId) return null;
    const snapshot = await getDoc(leaderboardRef(periodId));
    return snapshot.exists() ? (snapshot.data() as LeaderboardSnapshot) : null;
  },
};
