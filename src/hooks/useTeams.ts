import { useFirebase } from '@/hooks/useFirebase';
import { useEffect } from 'react';
import { Collections } from '@/utils/constants/FirebasePaths';
import useTeamsStore from '@/stores/Teams.store';
import usePomodoroStore from '@/stores/Pomodoro.store';
import { ITeam } from '@/interfaces/Teams.interface';

export const useTeams = () => {
  const db = useFirebase({ collectionPath: Collections.teams._path });
  const teams = useTeamsStore((state) => state.teams);
  const setTeams = useTeamsStore((state) => state.setTeams);
  const currentScuderia = usePomodoroStore((state) => state.currentScuderia);
  const setCurrentScuderia = usePomodoroStore((state) => state.setCurrentScuderia);

  useEffect(() => {
    if (!currentScuderia && teams.length) {
      setCurrentScuderia(teams[0]);
    }
  }, [teams, currentScuderia, setCurrentScuderia]);

  useEffect(() => {
    const getData = async () => {
      const teams = (await db.collectionWithIds([])) as ITeam[];
      setTeams(teams);
    };

    getData();
  }, [db, setTeams]);

  return {
    teams,
  };
};
