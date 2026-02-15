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
  arrayUnion,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Task } from '@/interfaces/Task.interface';

interface TaskOrderDoc {
  order: string[];
  updatedAt: Timestamp;
}

export const taskService = {
  async create(taskData: Task, userId: string) {
    const taskDataWithoutOrder = { ...taskData };
    delete (taskDataWithoutOrder as Partial<Task>).order;

    const newTaskDoc = await setDoc(doc(db, `users/${userId}/tasks`, taskData.id), {
      ...taskDataWithoutOrder,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isSync: true,
      stats: {
        totalWorkTime: 0,
        totalBreakTime: 0,
        totalPausedTime: 0,
        totalPauses: 0,
        totalInterruptions: 0,
        lastSessionAt: Timestamp.now(),
      },
    });

    updateDoc(doc(db, 'users', userId, 'tasksList', 'activeTasks'), {
      order: arrayUnion(taskData.id),
      updatedAt: Timestamp.now(),
    });

    return newTaskDoc;
  },

  async update(userId: string, taskId: string, updates: Partial<Task>) {
    const updatesWithoutOrder = { ...updates };
    delete (updatesWithoutOrder as Partial<Task>).order;

    await updateDoc(doc(db, 'users', userId, 'tasks', taskId), {
      ...updatesWithoutOrder,
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

  async saveActiveTasksOrder(userId: string, orderIds: string[]) {
    await setDoc(doc(db, 'users', userId, 'tasksList', 'activeTasks'), {
      order: orderIds,
      updatedAt: Timestamp.now(),
    });
  },

  async getActiveTasksOrder(userId: string): Promise<string[]> {
    const orderDoc = await getDoc(doc(db, 'users', userId, 'tasksList', 'activeTasks'));
    return orderDoc.exists() ? (orderDoc.data() as TaskOrderDoc).order : [];
  },

  async resetAllTasks(userId: string) {
    const q = query(collection(db, 'users', userId, 'tasks'), where('isSync', '==', true));
    const snapshot = await getDocs(q);
    const tasks = snapshot.docs.map((doc) => doc.id);

    for (const taskId of tasks) {
      await this.delete(userId, taskId);
    }

    await this.saveActiveTasksOrder(userId, []);
  },

  async getTasks(userId: string): Promise<Task[]> {
    const q = query(collection(db, 'users', userId, 'tasks'), orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);
    const tasks = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Task[];

    const savedActiveOrder = await this.getActiveTasksOrder(userId);

    if (savedActiveOrder.length === 0) {
      return tasks.map((task, index) => ({ ...task, order: index + 1 }));
    }

    const taskMap = new Map(tasks.map((t) => [t.id, t]));
    const orderedTasks: Task[] = [];

    savedActiveOrder.forEach((id, index) => {
      const task = taskMap.get(id);
      if (task) {
        orderedTasks.push({ ...task, order: index + 1 });
        taskMap.delete(id);
      }
    });

    taskMap.forEach((task) => {
      orderedTasks.push({ ...task, order: orderedTasks.length + 1 });
    });

    return orderedTasks;
  },

  async syncTasks(userId: string) {
    const stored = localStorage.getItem('pitmydoro_tasks');
    if (!stored) return;

    const data = JSON.parse(stored);
    const unsyncTasks = data?.state?.tasks.filter((task: Task) => !task.isSync);
    if (!unsyncTasks?.length) return;

    for (let i = 0; i < unsyncTasks.length; i++) {
      await this.create({ ...unsyncTasks[i] } as Task, userId);
    }
  },
};
