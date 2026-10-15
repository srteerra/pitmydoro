export const IS_EMULATOR_MODE = process.env.NEXT_PUBLIC_FIREBASE_EMULATORS === 'true';

export const EMULATOR_PROJECT_ID = 'demo-pitmydoro';

export const EMULATOR_HOST = '127.0.0.1';

export const EMULATOR_PORTS = {
  firestore: 8080,
  auth: 9099,
  storage: 9199,
};

export const EMULATOR_FIREBASE_CONFIG = {
  apiKey: 'demo-api-key',
  authDomain: `${EMULATOR_PROJECT_ID}.firebaseapp.com`,
  projectId: EMULATOR_PROJECT_ID,
  storageBucket: `${EMULATOR_PROJECT_ID}.appspot.com`,
  appId: 'demo-app-id',
};
