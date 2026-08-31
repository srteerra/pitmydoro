import { create } from 'zustand';
import { ProfileTheme } from '@/interfaces/ProfileTheme.interface';

interface ProfileThemeStore {
  theme: ProfileTheme | null;
  setTheme: (theme: ProfileTheme | null) => void;
}

const useProfileThemeStore = create<ProfileThemeStore>((set) => ({
  theme: null,
  setTheme: (theme) => set({ theme }),
}));

export default useProfileThemeStore;
