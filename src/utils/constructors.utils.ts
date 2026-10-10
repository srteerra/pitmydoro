import { ConstructorEntry } from '@/interfaces/Leaderboard.interface';
import { Team } from '@/interfaces/Teams.interface';
import { resolveTeam } from '@/utils/profileTheme.utils';

export interface ConstructorRow extends ConstructorEntry {
  team: Team;
}

export const toConstructorRows = (entries: ConstructorEntry[]): ConstructorRow[] =>
  entries.flatMap((entry) => {
    const team = resolveTeam(entry.teamId);
    return team ? [{ ...entry, team }] : [];
  });
