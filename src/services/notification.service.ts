import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { AppNotification } from '@/interfaces/Notification.interface';
import { NOTIFICATIONS_PAGE_SIZE, UNREAD_BADGE_LIMIT } from '@/constants/Social';

const MAX_BATCH_WRITES = 500;

const notificationsCollection = (userId: string) =>
  collection(db, 'users', userId, 'notifications');

const notificationRef = (userId: string, notificationId: string) =>
  doc(db, 'users', userId, 'notifications', notificationId);

const readUpdate = () => ({ read: true, readAt: serverTimestamp() });

export const notificationService = {
  subscribeRecent(userId: string, callback: (notifications: AppNotification[]) => void) {
    const recentQuery = query(
      notificationsCollection(userId),
      orderBy('createdAt', 'desc'),
      limit(NOTIFICATIONS_PAGE_SIZE)
    );

    return onSnapshot(
      recentQuery,
      (snapshot) =>
        callback(snapshot.docs.map((snap) => ({ ...snap.data(), id: snap.id }) as AppNotification)),
      () => callback([])
    );
  },

  subscribeUnreadCount(userId: string, callback: (count: number) => void) {
    const unreadQuery = query(
      notificationsCollection(userId),
      where('read', '==', false),
      limit(UNREAD_BADGE_LIMIT + 1)
    );

    return onSnapshot(
      unreadQuery,
      (snapshot) => callback(snapshot.size),
      () => callback(0)
    );
  },

  async markAsRead(userId: string, notificationId: string) {
    await updateDoc(notificationRef(userId, notificationId), readUpdate());
  },

  async markAllAsRead(userId: string) {
    const unreadQuery = query(
      notificationsCollection(userId),
      where('read', '==', false),
      limit(MAX_BATCH_WRITES)
    );
    const snapshot = await getDocs(unreadQuery);
    if (snapshot.empty) return;

    const batch = writeBatch(db);
    snapshot.docs.forEach((snap) => batch.update(snap.ref, readUpdate()));
    await batch.commit();
  },
};
