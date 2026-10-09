import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export const projectId = process.env.GCLOUD_PROJECT || 'demo-pitmydoro';

export const assertEmulator = () => {
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    throw new Error('FIRESTORE_EMULATOR_HOST is not set; refusing to touch a real Firestore.');
  }
};

export const assertEmulatorReachable = async () => {
  assertEmulator();
  try {
    await fetch(`http://${process.env.FIRESTORE_EMULATOR_HOST}/`);
  } catch {
    throw new Error(
      `Firestore emulator is not running at ${process.env.FIRESTORE_EMULATOR_HOST}. Start it with: firebase emulators:start --only firestore`
    );
  }
};

export const db = () => {
  assertEmulator();
  if (getApps().length === 0) initializeApp({ projectId });
  return getFirestore();
};

export const clearFirestore = async () => {
  assertEmulator();
  const url = `http://${process.env.FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/${projectId}/databases/(default)/documents`;
  const response = await fetch(url, { method: 'DELETE' });
  if (!response.ok) throw new Error(`Failed to clear emulator: ${response.status}`);
};

export const seedProfile = (uid, profile) => db().collection('profiles').doc(uid).set(profile);

export const seedDay = (uid, date, data) =>
  db()
    .collection('profiles')
    .doc(uid)
    .collection('dailyStats')
    .doc(date)
    .set({ date, ...data });
