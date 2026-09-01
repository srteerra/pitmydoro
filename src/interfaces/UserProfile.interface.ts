import { Timestamp } from 'firebase/firestore';
import { Socials } from '@/interfaces/Socials.interface';
import { ProfileTheme } from '@/interfaces/ProfileTheme.interface';
import { UserStreak } from '@/interfaces/UserStreak.interface';

export interface UserProfile {
  username: string;
  displayName: string;
  bio: string;
  location: string;
  favoriteTeam: string | null;
  profileTheme?: ProfileTheme;
  profileBackground?: string | null;
  favoriteFlag?: string;
  socials?: Socials;
  streak?: UserStreak;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastConnection?: Timestamp;
}
