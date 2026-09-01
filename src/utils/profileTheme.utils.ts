import { Team } from '@/interfaces/Teams.interface';
import { ProfileTheme } from '@/interfaces/ProfileTheme.interface';
import { SCUDERIAS } from '@/constants/Scuderias';

export const DEFAULT_PROFILE_THEME: ProfileTheme = {
  background: '#EEF0F4',
  accent: '#E2E6EC',
  primary: '#8A94A6',
};

export function themeFromTeam(team: Team): ProfileTheme {
  return {
    background: team.colors.background.session,
    accent: team.colors.background.shortBreak,
    primary: team.colors.primary.default,
  };
}

export const DEFAULT_PROFILE_BANNER = '#D9D2F5';

export function bannerFromColor(color?: string | null): string {
  return color || DEFAULT_PROFILE_BANNER;
}

export function resolveTeam(teamId: string | null | undefined): Team | null {
  if (!teamId) return null;
  return SCUDERIAS.find((team) => team.id === teamId) ?? null;
}
