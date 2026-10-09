import { getAuth } from 'firebase-admin/auth';
import { createRandom } from './random.mjs';
import { buildUser } from './profiles.mjs';
import { writeUserDocuments } from './writers.mjs';

const DEMO_RANDOM_SEED = 77;

export const DEMO_ACCOUNT = {
  uid: 'demo_driver',
  email: 'demo@pitmydoro.dev',
  password: 'pitmydoro',
  username: 'demo_driver',
  displayName: 'Demo Driver',
  flag: '🏁',
  location: 'Pit Lane',
};

const isAuthEmulatorReachable = async () => {
  const host = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  if (!host) return false;
  try {
    await fetch(`http://${host}/`);
    return true;
  } catch {
    return false;
  }
};

const ensureAuthUser = async () => {
  const auth = getAuth();
  try {
    await auth.getUser(DEMO_ACCOUNT.uid);
  } catch {
    await auth.createUser({
      uid: DEMO_ACCOUNT.uid,
      email: DEMO_ACCOUNT.email,
      password: DEMO_ACCOUNT.password,
      displayName: DEMO_ACCOUNT.displayName,
      emailVerified: true,
    });
  }
};

const ensureProfile = async (firestore, now) => {
  const profileRef = firestore.collection('profiles').doc(DEMO_ACCOUNT.uid);
  if ((await profileRef.get()).exists) return;

  const user = buildUser(createRandom(DEMO_RANDOM_SEED), DEMO_ACCOUNT, now, {
    uid: DEMO_ACCOUNT.uid,
    personaId: 'regular',
    teamId: 'ferrari',
    email: DEMO_ACCOUNT.email,
  });
  const writer = firestore.bulkWriter();
  writeUserDocuments(firestore, writer, user);
  await writer.close();
};

export const ensureDemoAccount = async (firestore, now) => {
  if (!(await isAuthEmulatorReachable())) {
    console.warn('Auth emulator not reachable: skipping the demo account.');
    return false;
  }

  await ensureAuthUser();
  await ensureProfile(firestore, now);
  return true;
};
