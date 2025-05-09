import { IPomodoro } from "@/interfaces/Pomodoro.interface";

export interface ITask {
  id: string;
  title: string;
  description: string;
  order: number;
  completed: boolean;
  pomodoros: IPomodoro[];
  createdAt?: number;
}