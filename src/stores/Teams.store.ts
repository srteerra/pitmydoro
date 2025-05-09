import { create } from "zustand";
import { ITeam } from "@/interfaces/Teams.interface";

interface TeamsStore {
  teams: ITeam[];
  fetched: boolean;
}

interface TeamsActions {
  setTeams: (teams: ITeam[]) => void;
}

const useTeamsStore = create<TeamsStore & TeamsActions>((set) => ({
  teams: [],
  fetched: false,
  setTeams: (teams) => set(() => ({ teams, fetched: true})),
}));

export default useTeamsStore;