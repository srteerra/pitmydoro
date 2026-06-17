import { Timestamp } from 'firebase/firestore';

export interface TaskStats {
  totalWorkTime: number;
  totalBreakTime: number;
  totalPausedTime: number;
  totalPauses: number;
  totalInterruptions: number;
  lastSessionAt: Timestamp;
}

export interface TaskStatsDelta {
  workTime?: number;
  breakTime?: number;
  pomodoros?: number;
  pausedTime?: number;
  pauses?: number;
  interruptions?: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  estimatedPomodoros: number;
  totalPomodoros: number;
  isSync?: boolean;
  order?: number;
  completedAt?: Timestamp | null;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  projectId?: string;
  priority?: number;
  deletedAt?: Timestamp;
  archiveAt?: Timestamp;
  archive?: boolean;
  recurring?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    nextDueDate: Timestamp;
  };
  stats?: TaskStats;
}

export interface EditTask {
  description: string;
  title: string;
  taskCompletedPomodoros: number;
  numberOfPomodoros: number;
}
