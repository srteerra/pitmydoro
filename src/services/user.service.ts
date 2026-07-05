import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { User } from 'firebase/auth';
import { DefaultSettings } from '@/constants/DefaultSettings';
import { Settings } from '@/interfaces/Settings.interface';
import { OverlaySettings } from '@/interfaces/Overlay.interface';

const STORAGE_SETTINGS_KEY = 'pitmydoro_settings';

interface UserProfile {
  username: string;
  displayName: string;
  bio: string;
  photoURL: string;
  coverURL: string;
  location: string;
  favoriteTeam: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  uid?: string;
}

interface UserData {
  email: string;
  preferences: Settings;
  overlay?: OverlaySettings;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 20;
const USERNAME_PATTERN = /^[a-z0-9_]+$/;

function normalizeUsername(raw: string): string {
  return (raw || '').trim().toLowerCase();
}

function isValidUsername(username: string): boolean {
  return (
    username.length >= USERNAME_MIN_LENGTH &&
    username.length <= USERNAME_MAX_LENGTH &&
    USERNAME_PATTERN.test(username)
  );
}

function usernameFromEmail(email: string | null): string {
  const base = (email || 'user')
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '');
  return base.length >= USERNAME_MIN_LENGTH ? base : `${base}user`.slice(0, USERNAME_MAX_LENGTH);
}

async function isUsernameTaken(username: string): Promise<boolean> {
  const reservation = await getDoc(doc(db, 'usernames', username));
  if (reservation.exists()) return true;

  const q = query(collection(db, 'profiles'), where('username', '==', username), limit(1));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

export const userService = {
  isValidUsername(raw: string): boolean {
    return isValidUsername(normalizeUsername(raw));
  },

  async isUsernameAvailable(raw: string): Promise<boolean> {
    const username = normalizeUsername(raw);
    if (!isValidUsername(username)) return false;
    return !(await isUsernameTaken(username));
  },

  async create(user: User, desiredUsername?: string) {
    const stored = localStorage.getItem(STORAGE_SETTINGS_KEY);
    const storedPreferences = stored ? JSON.parse(stored) : DefaultSettings;

    const requested = desiredUsername ? normalizeUsername(desiredUsername) : '';
    const base =
      requested && isValidUsername(requested) ? requested : usernameFromEmail(user.email);

    let candidate = base;
    let counter = 1;

    for (let attempt = 0; attempt < 100; attempt++) {
      if (await isUsernameTaken(candidate)) {
        candidate = `${base}${counter++}`;
        continue;
      }

      try {
        await runTransaction(db, async (tx) => {
          const usernameRef = doc(db, 'usernames', candidate);
          const snapshot = await tx.get(usernameRef);
          if (snapshot.exists()) throw new Error('USERNAME_TAKEN');

          tx.set(usernameRef, {
            uid: user.uid,
            createdAt: serverTimestamp(),
          });

          tx.set(doc(db, 'users', user.uid), {
            email: user.email,
            preferences: storedPreferences,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          tx.set(doc(db, 'profiles', user.uid), {
            username: candidate,
            displayName: user.displayName || candidate,
            bio: '',
            photoURL: user.photoURL || '',
            coverURL: '',
            location: '',
            favoriteTeam: null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });

        return candidate;
      } catch (err: any) {
        if (err?.message === 'USERNAME_TAKEN') {
          candidate = `${base}${counter++}`;
          continue;
        }
        throw err;
      }
    }

    throw new Error('USERNAME_UNAVAILABLE');
  },

  async changeUsername(userId: string, newUsername: string): Promise<string> {
    const next = normalizeUsername(newUsername);
    if (!isValidUsername(next)) throw new Error('USERNAME_INVALID');

    await runTransaction(db, async (tx) => {
      const nextRef = doc(db, 'usernames', next);
      const nextSnap = await tx.get(nextRef);

      if (nextSnap.exists()) {
        if (nextSnap.data().uid === userId) return;
        throw new Error('USERNAME_TAKEN');
      }

      const profileRef = doc(db, 'profiles', userId);
      const current = (await tx.get(profileRef)).data()?.username as string | undefined;

      tx.set(nextRef, { uid: userId, createdAt: serverTimestamp() });
      tx.update(profileRef, { username: next, updatedAt: serverTimestamp() });

      if (current && current !== next) {
        tx.delete(doc(db, 'usernames', current));
      }
    });

    return next;
  },

  async exists(userId: string): Promise<boolean> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists();
  },

  async getProfile(userId: string): Promise<UserProfile | null> {
    const profileDoc = await getDoc(doc(db, 'profiles', userId));
    return profileDoc.exists() ? ({ ...profileDoc.data(), uid: userId } as UserProfile) : null;
  },

  async getUserData(userId: string): Promise<UserData | null> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? (userDoc.data() as UserData) : null;
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    await updateDoc(doc(db, 'profiles', userId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  async updatePreferences(userId: string, preferences: Partial<UserData['preferences']>) {
    const updates: Record<string, any> = {};

    Object.keys(preferences).forEach((key) => {
      updates[`preferences.${key}`] = preferences[key as keyof typeof preferences];
    });

    updates.updatedAt = serverTimestamp();

    await updateDoc(doc(db, 'users', userId), updates);
  },

  async getOverlaySettings(userId: string): Promise<OverlaySettings | null> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const data = userDoc.data() as { overlay?: OverlaySettings } | undefined;
    return data?.overlay ?? null;
  },

  async updateOverlaySettings(userId: string, settings: Partial<OverlaySettings>) {
    const updates: Record<string, any> = { updatedAt: serverTimestamp() };
    if (settings.token !== undefined) updates['overlay.token'] = settings.token;
    if (settings.enabled !== undefined) updates['overlay.enabled'] = settings.enabled;
    await updateDoc(doc(db, 'users', userId), updates);
  },
};
