import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions';
import { FieldValue, getFirestore, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { buildNotification, NOTIFICATION_TYPES, notificationRef } from './notifications';

const isStringList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string' && item.length > 0);

const allUserIds = async function* (): AsyncGenerator<string> {
  const stream = getFirestore().collection('users').select().stream();

  for await (const chunk of stream) {
    yield (chunk as unknown as QueryDocumentSnapshot).id;
  }
};

const listedUserIds = async function* (uids: string[]): AsyncGenerator<string> {
  for (const uid of new Set(uids)) yield uid;
};

const deliver = async (broadcast: QueryDocumentSnapshot, recipients: AsyncGenerator<string>) => {
  const notification = buildNotification({
    type: NOTIFICATION_TYPES.system,
    title: broadcast.get('title') ?? null,
    body: broadcast.get('body') ?? null,
    link: broadcast.get('link') ?? null,
  });

  const writer = getFirestore().bulkWriter();
  let delivered = 0;

  for await (const uid of recipients) {
    void writer.set(notificationRef(uid, `broadcast_${broadcast.id}`), notification);
    delivered++;
  }

  await writer.close();
  return delivered;
};

export const onBroadcastCreated = onDocumentCreated(
  { document: 'broadcasts/{broadcastId}', region: 'us-central1', timeoutSeconds: 540 },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot || snapshot.get('deliveredAt')) return;

    const targetUids = snapshot.get('targetUids');
    const recipients = isStringList(targetUids) ? listedUserIds(targetUids) : allUserIds();
    const delivered = await deliver(snapshot, recipients);

    await snapshot.ref.update({ deliveredAt: FieldValue.serverTimestamp(), delivered });

    logger.info('broadcast delivered', { broadcastId: snapshot.id, delivered });
  }
);
