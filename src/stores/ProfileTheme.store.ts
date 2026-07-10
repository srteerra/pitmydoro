import { create } from 'zustand';
import { Team } from '@/interfaces/Teams.interface';

interface ProfileThemeStore {
  team: Team | null;
  setTeam: (team: Team | null) => void;
}

const useProfileThemeStore = create<ProfileThemeStore>((set) => ({
  team: null,
  setTeam: (team) => set({ team }),
}));

export default useProfileThemeStore;
