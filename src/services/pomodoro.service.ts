import { collection, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Pomodoro } from '@/interfaces/Pomodoro.interface';

export const pomodoroService = {
  async create(pomodoroData: Omit<Pomodoro, 'id'>, userId: string) {
    const docRef = await addDoc(collection(db, 'pomodoros'), {
      ...pomodoroData,
      userId,
      status: 'running',
      completed: false,
      interrupted: false,
      pauses: [],
    });

    return docRef.id;
  },

  async pause(pomodoroId: string) {
    await updateDoc(doc(db, 'pomodoros', pomodoroId), {
      status: 'paused',
    });
  },

  async resume(pomodoroId: string, pauses: any[]) {
    await updateDoc(doc(db, 'pomodoros', pomodoroId), {
      status: 'running',
      pauses,
    });
  },

  async complete(pomodoroId: string) {
    await updateDoc(doc(db, 'pomodoros', pomodoroId), {
      status: 'completed',
      completed: true,
      endAt: Timestamp.now(),
    });
  },

  async interrupt(pomodoroId: string) {
    await updateDoc(doc(db, 'pomodoros', pomodoroId), {
      status: 'interrupted',
      interrupted: true,
      endAt: Timestamp.now(),
    });
  },
};
