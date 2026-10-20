import { ProfileMap } from './profiles';
import { isTeamId, TeamId } from './teams';

export interface ConstructorEntry {
  rank: number;
  teamId: TeamId;
  pomodoroTime: number;
  drivers: number;
}

export const rankConstructors = (
  totals: Map<string, number>,
  profiles: ProfileMap
): ConstructorEntry[] => {
  const teams = new Map<TeamId, { pomodoroTime: number; drivers: number }>();

  for (const [uid, pomodoroTime] of totals) {
    const teamId = profiles.get(uid)?.get('favoriteTeam');
    if (pomodoroTime <= 0 || !isTeamId(teamId)) continue;

    const team = teams.get(teamId) ?? { pomodoroTime: 0, drivers: 0 };
    teams.set(teamId, {
      pomodoroTime: team.pomodoroTime + pomodoroTime,
      drivers: team.drivers + 1,
    });
  }

  return [...teams.entries()]
    .sort((a, b) => b[1].pomodoroTime - a[1].pomodoroTime || a[0].localeCompare(b[0]))
    .map(([teamId, team], index) => ({ rank: index + 1, teamId, ...team }));
};
