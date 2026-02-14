import { Team } from '@/interfaces/Teams.interface';
import { Timestamp } from 'firebase/firestore';
import { Task } from '@/interfaces/Task.interface';

export interface Pomodoro {
  id: string;
  type: 'session' | 'shortBreak' | 'longBreak';
  duration: number | null;
  startAt: Timestamp;
  startTeam: Team;
  endTeam?: Team | null;
  task?: Task | null;
  status?: 'running' | 'paused' | 'completed' | 'interrupted';
  pauses?: { pausedAt: Timestamp; resumedAt: Timestamp }[];
  endAt?: Timestamp | null;
  completed?: boolean;
  interrupted?: boolean;
}
