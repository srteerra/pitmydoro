import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Task, TaskStatsDelta } from '@/interfaces/Task.interface';

export const emptyTaskStats = () => ({
  totalWorkTime: 0,
  totalBreakTime: 0,
  totalPausedTime: 0,
  totalPauses: 0,
  totalInterruptions: 0,
  lastSessionAt: Timestamp.now(),
});

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
      archive: taskDataWithoutOrder.archive ?? false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isSync: true,
      stats: taskData.stats ?? emptyTaskStats(),
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

  async archive(userId: string, taskId: string) {
    await updateDoc(doc(db, 'users', userId, 'tasks', taskId), {
      archive: true,
      archiveAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  },

  async complete(userId: string, taskId: string, isComplete?: boolean) {
    await updateDoc(doc(db, 'users', userId, 'tasks', taskId), {
      completedAt: isComplete ? Timestamp.now() : null,
      updatedAt: Timestamp.now(),
    });
  },

  async updateTaskStats(userId: string, taskId: string, stats: TaskStatsDelta) {
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);

    const updates: Record<string, unknown> = {
      updatedAt: Timestamp.now(),
      'stats.lastSessionAt': Timestamp.now(),
    };

    if (stats.workTime !== undefined) updates['stats.totalWorkTime'] = increment(stats.workTime);
    if (stats.breakTime !== undefined) updates['stats.totalBreakTime'] = increment(stats.breakTime);
    if (stats.pomodoros !== undefined) updates.totalPomodoros = increment(stats.pomodoros);
    if (stats.pausedTime !== undefined)
      updates['stats.totalPausedTime'] = increment(stats.pausedTime);
    if (stats.pauses !== undefined) updates['stats.totalPauses'] = increment(stats.pauses);
    if (stats.interruptions !== undefined)
      updates['stats.totalInterruptions'] = increment(stats.interruptions);
    if (stats.shortBreaks !== undefined)
      updates['stats.totalShortBreaks'] = increment(stats.shortBreaks);
    if (stats.longBreaks !== undefined)
      updates['stats.totalLongBreaks'] = increment(stats.longBreaks);
    if (stats.record !== undefined) updates['stats.pomodoros'] = arrayUnion(stats.record);

    await updateDoc(taskRef, updates);
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

    for (const docSnap of snapshot.docs) {
      await updateDoc(doc(db, 'users', userId, 'tasks', docSnap.id), {
        archive: true,
        archiveAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }

    await this.saveActiveTasksOrder(userId, []);
  },

  async unarchiveTasks(userId: string, taskIds: string[]) {
    for (const taskId of taskIds) {
      await updateDoc(doc(db, 'users', userId, 'tasks', taskId), {
        archive: false,
        archiveAt: null,
        updatedAt: Timestamp.now(),
      });
    }
  },

  async getTasks(userId: string): Promise<Task[]> {
    const q = query(
      collection(db, 'users', userId, 'tasks'),
      where('archive', '==', false),
      orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(q);
    const tasks = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as Task[];

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
