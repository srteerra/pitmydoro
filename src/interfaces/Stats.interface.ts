import { Timestamp } from 'firebase/firestore';

export interface DailyStats {
  date: string;
  workTime: number;
  breakTime: number;
  pausedTime: number;
  pomodoros: number;
  sprites: Record<string, number>;
  updatedAt: Timestamp;
}
