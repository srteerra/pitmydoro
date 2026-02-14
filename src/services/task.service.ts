import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Task } from '@/interfaces/Task.interface';

const STORAGE_KEY = 'pitmydoro_offline_tasks';

export const taskService = {
  async create(taskData: Task, userId: string) {
    const docRef = await addDoc(collection(db, 'users', userId, 'tasks'), {
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

    return docRef.id;
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

  subscribe(userId: string, callback: (tasks: Task[]) => void) {
    const q = query(collection(db, 'users', userId, 'tasks'), orderBy('order', 'asc'));

    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(
        (doc) =>
          ({
            ...doc.data(),
            id: doc.id,
          }) as Task
      );
      callback(tasks);
    });
  },

  local: {
    save(tasks: Task[]) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    },

    load(): Task[] {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    },

    clear() {
      localStorage.removeItem(STORAGE_KEY);
    },

    add(task: Task): Task {
      const newTask: Task = {
        ...task,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isSync: false,
        stats: {
          totalWorkTime: 0,
          totalBreakTime: 0,
          totalPausedTime: 0,
          totalPauses: 0,
          totalInterruptions: 0,
          lastSessionAt: Timestamp.now(),
        },
      };

      const tasks = this.load();
      const updated = [...tasks, newTask];
      this.save(updated);
      return newTask;
    },

    update(id: string, updates: Partial<Task>) {
      const tasks = this.load();
      const updated = tasks.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: Timestamp.now() } : t
      );
      this.save(updated);
    },

    delete(id: string) {
      const tasks = this.load();
      const updated = tasks.filter((t) => t.id !== id);
      this.save(updated);
    },
  },
};
