import { getApps, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectStorageEmulator, getStorage } from 'firebase/storage';
import {
  EMULATOR_FIREBASE_CONFIG,
  EMULATOR_HOST,
  EMULATOR_PORTS,
  IS_EMULATOR_MODE,
} from '@/constants/Emulators';

const firebaseConfig = IS_EMULATOR_MODE
  ? EMULATOR_FIREBASE_CONFIG
  : {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

const emulatorFlag = globalThis as typeof globalThis & { __firebaseEmulatorsConnected?: boolean };

if (IS_EMULATOR_MODE && !emulatorFlag.__firebaseEmulatorsConnected) {
  connectFirestoreEmulator(db, EMULATOR_HOST, EMULATOR_PORTS.firestore);
  connectAuthEmulator(auth, `http://${EMULATOR_HOST}:${EMULATOR_PORTS.auth}`);
  connectStorageEmulator(storage, EMULATOR_HOST, EMULATOR_PORTS.storage);
  emulatorFlag.__firebaseEmulatorsConnected = true;
}

export { app };
