import { Timestamp } from 'firebase/firestore';
import { BadgeId, UserBadges } from '@/interfaces/Badge.interface';

export type LeaderboardPeriodType = 'weekly' | 'monthly';

export interface LeaderboardEntry {
  rank: number;
  uid: string;
  username: string;
  displayName: string;
  photoURL: string | null;
  favoriteFlag: string | null;
  badges?: UserBadges | null;
  featuredBadge?: BadgeId | null;
  pomodoroTime: number;
  workTime?: number;
}

export interface LeaderboardSnapshot {
  periodId: string;
  type: LeaderboardPeriodType;
  from: string;
  to: string;
  metric: 'workTime' | 'pomodoroTime';
  top: LeaderboardEntry[];
  participants: number;
  sealed: boolean;
  computedAt: Timestamp;
  version: number;
}

export interface CurrentLeaderboards {
  weekly: LeaderboardSnapshot;
  monthly: LeaderboardSnapshot;
  computedAt: Timestamp;
  version: number;
}
