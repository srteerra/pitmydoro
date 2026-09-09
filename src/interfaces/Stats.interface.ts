import { Timestamp } from 'firebase/firestore';
import { TaskStatsDelta } from '@/interfaces/Task.interface';

export interface DailyStats {
  date: string;
  workTime: number;
  breakTime: number;
  pausedTime: number;
  pomodoros: number;
  pauses?: number;
  interruptions?: number;
  tasksCreated?: number;
  tasksCompleted?: number;
  sprites: Record<string, number>;
  updatedAt: Timestamp;
}

export interface DailyStatsDelta extends TaskStatsDelta {
  tasksCreated?: number;
  tasksCompleted?: number;
}
