import { Timestamp } from 'firebase/firestore';
import { TaskStatsDelta } from '@/interfaces/Task.interface';

export interface DailyStats {
  date: string;
  utcDate?: string;
  workTime: number;
  pomodoroTime?: number;
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
  pomodoroTime?: number;
  tasksCreated?: number;
  tasksCompleted?: number;
}
