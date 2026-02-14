import {
  collection,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  getDoc,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Task } from '@/interfaces/Task.interface';

export const taskService = {
  async create(taskData: Task, userId: string) {
    return await setDoc(doc(db, `users/${userId}/tasks`, taskData.id), {
      ...taskData,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isSync: true,
      stats: {
        totalWorkTime: 0,
        totalBreakTime: 0,
        totalPomodoros: 0,
        totalPausedTime: 0,
        totalPauses: 0,
        totalInterruptions: 0,
        lastSessionAt: Timestamp.now(),
      },
    });
  },

  async update(userId: string, taskId: string, updates: Partial<Task>) {
    await updateDoc(doc(db, 'users', userId, 'tasks', taskId), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  async delete(userId: string, taskId: string) {
    await deleteDoc(doc(db, 'users', userId, 'tasks', taskId));
  },

  async complete(userId: string, taskId: string, isComplete?: boolean) {
    await updateDoc(doc(db, 'users', userId, 'tasks', taskId), {
      completedAt: isComplete ? Timestamp.now() : null,
      updatedAt: Timestamp.now(),
    });
  },

  async incrementPomodoro(userId: string, taskId: string, workMinutes: number) {
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    const snap = await getDoc(taskRef);
    const data = snap.data() || {};
    const totalPomodoros = (data.totalPomodoros ?? 0) + 1;
    const totalWorkTime = (data.stats?.totalWorkTime ?? 0) + workMinutes;
    await updateDoc(taskRef, {
      totalPomodoros,
      'stats.totalWorkTime': totalWorkTime,
      'stats.lastSessionAt': Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  },

  async incrementInterruption(userId: string, taskId: string) {
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    const snap = await getDoc(taskRef);
    const data = snap.data() || {};
    const totalInterruptions = (data.stats?.totalInterruptions ?? 0) + 1;
    await updateDoc(taskRef, {
      'stats.totalInterruptions': totalInterruptions,
      updatedAt: Timestamp.now(),
    });
  },

  async getTasks(userId: string): Promise<Task[]> {
    const q = query(collection(db, 'users', userId, 'tasks'), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) =>
        ({
          ...doc.data(),
          id: doc.id,
        }) as Task
    );
  },

  async syncTasks(userId: string) {
    const stored = localStorage.getItem('pitmydoro_tasks');
    if (!stored) return;

    const data = JSON.parse(stored);
    const unsyncTasks = data?.state?.tasks.filter((task: Task) => !task.isSync);
    if (!unsyncTasks?.length) return;

    const batch = writeBatch(db);

    for (const task of unsyncTasks) {
      await this.create(task, userId);
    }

    await batch.commit();
  },
};
