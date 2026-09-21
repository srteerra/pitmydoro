import { create } from 'zustand';
import { Timestamp } from 'firebase/firestore';
import { userService } from '@/services/user.service';
import { Socials } from '@/interfaces/Socials.interface';
import { ProfileTheme } from '@/interfaces/ProfileTheme.interface';
import { UserStreak } from '@/interfaces/UserStreak.interface';
import { BadgeId, UserBadges } from '@/interfaces/Badge.interface';

interface UserProfile {
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
  lastConnection?: Timestamp;
  uid?: string;
}

interface UserStore {
  profile: UserProfile | null;
  loadingProfile: boolean;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  clearProfile: () => void;
}

const useUserStore = create<UserStore>((set) => ({
  profile: null,
  loadingProfile: false,

  fetchProfile: async (userId: string) => {
    set({ loadingProfile: true });
    const profile = await userService.getProfile(userId);
    set({ profile, loadingProfile: false });
  },

  updateProfile: (updates) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...updates } : null,
    })),

  clearProfile: () => set({ profile: null }),
}));

export default useUserStore;
