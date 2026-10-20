import { FieldValue, getFirestore } from 'firebase-admin/firestore';

export const NOTIFICATION_TYPES = {
  follow: 'follow',
  comment: 'comment',
  reaction: 'reaction',
  system: 'system',
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export type LocalizedText = string | Record<string, string>;

export interface NotificationActor {
  uid: string;
  username: string;
  displayName: string;
  photoURL: string | null;
}

export interface NotificationPayload {
  type: NotificationType;
  actor?: NotificationActor | null;
  title?: LocalizedText | null;
  body?: LocalizedText | null;
  link?: string | null;
}

export const notificationRef = (userId: string, notificationId: string) =>
  getFirestore().collection('users').doc(userId).collection('notifications').doc(notificationId);

export const buildNotification = (payload: NotificationPayload) => ({
  type: payload.type,
  actor: payload.actor ?? null,
  title: payload.title ?? null,
  body: payload.body ?? null,
  link: payload.link ?? null,
  read: false,
  createdAt: FieldValue.serverTimestamp(),
});

export const getActor = async (uid: string): Promise<NotificationActor | null> => {
  const profile = await getFirestore().collection('profiles').doc(uid).get();
  const username = profile.get('username');
  if (!profile.exists || typeof username !== 'string' || username.length === 0) return null;

  const displayName = profile.get('displayName');
  const photoURL = profile.get('photoURL');

  return {
    uid,
    username,
    displayName: typeof displayName === 'string' && displayName.length > 0 ? displayName : username,
    photoURL: typeof photoURL === 'string' && photoURL.length > 0 ? photoURL : null,
  };
};
