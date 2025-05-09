import { useFirebase } from "@/hooks/useFirebase";
import { useEffect } from "react";
import { Collections } from "@/utils/constants/FirebasePaths";
import useTeamsStore from "@/stores/Teams.store";
import usePomodoroStore from "@/stores/Pomodoro.store";

export const useTeams = (loadData = false) => {
  const db = useFirebase({ collectionPath: Collections.teams._path, loadData });
  const teams = useTeamsStore(state => state.teams)
  const setTeams = useTeamsStore(state => state.setTeams)
  const currentScuderia = usePomodoroStore(state => state.currentScuderia)
  const setCurrentScuderia = usePomodoroStore(state => state.setCurrentScuderia)

  useEffect(() => {
    if (!currentScuderia && teams.length) {
      setCurrentScuderia(teams[0])
    }
  }, [teams, currentScuderia]);

  useEffect(() => {
    if (loadData) {
      db.listenCollection([], Collections.teams._path)
    }
  }, [loadData]);

  useEffect(() => {
    if (db?.docs?.length) setTeams(db.docs)
  }, [db.docs]);

  return {
    teams,
  };
}