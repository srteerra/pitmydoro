import { Timestamp } from 'firebase/firestore';
import { Socials } from '@/interfaces/Socials.interface';
import { ProfileTheme } from '@/interfaces/ProfileTheme.interface';
import { UserStreak } from '@/interfaces/UserStreak.interface';
import { BadgeId, UserBadges } from '@/interfaces/Badge.interface';

export interface UserProfile {
  uid?: string;
  username: string;
  displayName: string;
  bio: string;
  location: string;
  favoriteTeam: string | null;
  photoURL?: string | null;
  photoSourceURL?: string | null;
  profileTheme?: ProfileTheme;
  profileBackground?: string | null;
  favoriteFlag?: string;
  socials?: Socials;
  streak?: UserStreak;
  badges?: UserBadges;
  featuredBadge?: BadgeId | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastConnection?: Timestamp;
}
