import { onDocumentCreated, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions';
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';
import { buildNotification, getActor, NOTIFICATION_TYPES, notificationRef } from './notifications';

const FOLLOW_DOCUMENT = 'users/{followerId}/following/{followeeId}';

const RENOTIFY_COOLDOWN_MS = 24 * 60 * 60 * 1000;

const NOT_FOUND_CODE = 5;

const incrementProfileField = async (uid: string, field: string, delta: number) => {
  try {
    await getFirestore()
      .collection('profiles')
      .doc(uid)
      .update({ [field]: FieldValue.increment(delta) });
  } catch (error) {
    if ((error as { code?: number }).code !== NOT_FOUND_CODE) throw error;
  }
};

const shiftCounters = async (followerId: string, followeeId: string, delta: number) => {
  await Promise.all([
    incrementProfileField(followeeId, 'followersCount', delta),
    incrementProfileField(followerId, 'followingCount', delta),
  ]);
};

const recentlyNotified = async (followeeId: string, notificationId: string) => {
  const existing = await notificationRef(followeeId, notificationId).get();
  const createdAt = existing.get('createdAt');
  return createdAt instanceof Timestamp && Date.now() - createdAt.toMillis() < RENOTIFY_COOLDOWN_MS;
};

const notifyFollow = async (followerId: string, followeeId: string) => {
  const notificationId = `follow_${followerId}`;
  if (await recentlyNotified(followeeId, notificationId)) return;

  const actor = await getActor(followerId);
  if (!actor) return;

  await notificationRef(followeeId, notificationId).set(
    buildNotification({
      type: NOTIFICATION_TYPES.follow,
      actor,
      link: `/profile/${actor.username}`,
    })
  );
};

export const onFollowCreated = onDocumentCreated(
  { document: FOLLOW_DOCUMENT, region: 'us-central1' },
  async (event) => {
    const { followerId, followeeId } = event.params;
    if (followerId === followeeId) return;

    await shiftCounters(followerId, followeeId, 1);
    await notifyFollow(followerId, followeeId);

    logger.info('follow created', { followerId, followeeId });
  }
);

export const onFollowDeleted = onDocumentDeleted(
  { document: FOLLOW_DOCUMENT, region: 'us-central1' },
  async (event) => {
    const { followerId, followeeId } = event.params;
    if (followerId === followeeId) return;

    await shiftCounters(followerId, followeeId, -1);

    logger.info('follow deleted', { followerId, followeeId });
  }
);
