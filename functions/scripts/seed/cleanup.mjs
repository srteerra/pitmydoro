import { isSeedId } from './profiles.mjs';

const SEED_MARKER = 'seed_';

const deleteSeedDocuments = async (db, collectionName) => {
  const refs = await db.collection(collectionName).listDocuments();
  await Promise.all(refs.filter((ref) => isSeedId(ref.id)).map((ref) => db.recursiveDelete(ref)));
};

const deleteSeedUsernames = async (db) => {
  const snapshot = await db.collection('usernames').get();
  const seeded = snapshot.docs.filter((doc) => isSeedId(String(doc.get('uid') ?? '')));
  await Promise.all(seeded.map((doc) => doc.ref.delete()));
};

export const removeSeedData = async (db) => {
  await deleteSeedDocuments(db, 'profiles');
  await deleteSeedDocuments(db, 'users');
  await deleteSeedUsernames(db);
  await db.recursiveDelete(db.collection('leaderboards'));
};

export const removeViewerSeedData = async (db, viewerId) => {
  const userRef = db.collection('users').doc(viewerId);
  const [following, notifications] = await Promise.all([
    userRef.collection('following').listDocuments(),
    userRef.collection('notifications').listDocuments(),
  ]);

  await Promise.all([
    ...following.filter((ref) => isSeedId(ref.id)).map((ref) => ref.delete()),
    ...notifications.filter((ref) => ref.id.includes(SEED_MARKER)).map((ref) => ref.delete()),
  ]);
};
