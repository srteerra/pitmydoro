import { DocumentSnapshot, getFirestore } from 'firebase-admin/firestore';

const GET_ALL_CHUNK_SIZE = 300;

export type ProfileMap = Map<string, DocumentSnapshot>;

const chunk = <T>(items: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, (index + 1) * size)
  );

export const loadProfiles = async (uids: Iterable<string>): Promise<ProfileMap> => {
  const db = getFirestore();
  const profiles: ProfileMap = new Map();

  for (const group of chunk([...new Set(uids)], GET_ALL_CHUNK_SIZE)) {
    const snaps = await db.getAll(...group.map((uid) => db.collection('profiles').doc(uid)));
    snaps.filter((snap) => snap.exists).forEach((snap) => profiles.set(snap.id, snap));
  }

  return profiles;
};
