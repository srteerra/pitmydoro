import { Team } from '@/interfaces/Teams.interface';
import { Timestamp } from 'firebase/firestore';
import { Task } from '@/interfaces/Task.interface';

export interface Pomodoro {
  type: 'session' | 'shortBreak' | 'longBreak';
  duration: number;
  startAt: Timestamp;
  startTeam: Team;
  task: Task | null;
  status: 'running' | 'paused';
  currentPauseStart?: Timestamp;
}
