import { ITeam } from '@/interfaces/Teams.interface';

export interface IPomodoro {
  id: any;
  team: ITeam;
  duration: number | null;
  createdAt: number;
  startedAt?: number;
  isExternal?: boolean;
  skipped?: boolean;
  completedAt?: number | null;
}
