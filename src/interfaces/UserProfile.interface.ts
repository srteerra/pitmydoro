import { Timestamp } from 'firebase/firestore';
import { Team } from '@/interfaces/Teams.interface';
import { Socials } from '@/interfaces/Socials.interface';

export interface UserProfile {
  username: string;
  displayName: string;
  bio: string;
  photoURL: string;
  coverURL: string;
  location: string;
  favoriteTeam: Team | null;
  favoriteFlag?: string;
  socials?: Socials;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastConnection?: Timestamp;
}
