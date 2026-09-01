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
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { User } from 'firebase/auth';
import { DefaultSettings } from '@/constants/DefaultSettings';
import { Settings } from '@/interfaces/Settings.interface';
import { OverlaySettings } from '@/interfaces/Overlay.interface';
import { UserProfile as BaseUserProfile } from '@/interfaces/UserProfile.interface';
import { UserStreak } from '@/interfaces/UserStreak.interface';
import { DEFAULT_PROFILE_THEME } from '@/utils/profileTheme.utils';
import { advanceStreak, EMPTY_STREAK, localDayKey, resolveStreak } from '@/utils/streak.utils';

const STORAGE_SETTINGS_KEY = 'pitmydoro_settings';

type UserProfile = BaseUserProfile & { uid?: string };

interface UserData {
  email: string;
  preferences: Settings;
  overlay?: OverlaySettings;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastConnection?: Timestamp;
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

async function isUsernameTakenByOther(username: string, uid: string): Promise<boolean> {
  const reservation = await getDoc(doc(db, 'usernames', username));
  if (reservation.exists()) return reservation.data().uid !== uid;

  const q = query(collection(db, 'profiles'), where('username', '==', username), limit(1));
  const snapshot = await getDocs(q);
  return !snapshot.empty && snapshot.docs[0].id !== uid;
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

  async isUsernameAvailableInRegistry(raw: string): Promise<boolean> {
    const username = normalizeUsername(raw);
    if (!isValidUsername(username)) return false;
    const reservation = await getDoc(doc(db, 'usernames', username));
    return !reservation.exists();
  },

  async isUsernameAvailableFor(raw: string, uid: string): Promise<boolean> {
    const username = normalizeUsername(raw);
    if (!isValidUsername(username)) return false;
    return !(await isUsernameTakenByOther(username, uid));
  },

  async getUsernameOwner(raw: string): Promise<string | null> {
    const username = normalizeUsername(raw);
    if (!username) return null;
    const reservation = await getDoc(doc(db, 'usernames', username));
    return reservation.exists() ? ((reservation.data().uid as string) ?? null) : null;
  },

  async create(user: User, desiredUsername?: string) {
    const stored = localStorage.getItem(STORAGE_SETTINGS_KEY);
    const storedPreferences = stored ? JSON.parse(stored) : DefaultSettings;

    const [existingProfile, existingUser] = await Promise.all([
      getDoc(doc(db, 'profiles', user.uid)),
      getDoc(doc(db, 'users', user.uid)),
    ]);
    if (existingProfile.exists() && existingUser.exists()) {
      return existingProfile.data().username as string;
    }

    const requested = desiredUsername ? normalizeUsername(desiredUsername) : '';
    const base =
      requested && isValidUsername(requested) ? requested : usernameFromEmail(user.email);

    let candidate = base;
    let counter = 1;

    for (let attempt = 0; attempt < 100; attempt++) {
      if (await isUsernameTakenByOther(candidate, user.uid)) {
        candidate = `${base}${counter++}`;
        continue;
      }

      try {
        const settled = await runTransaction(db, async (tx) => {
          const profileRef = doc(db, 'profiles', user.uid);
          const userRef = doc(db, 'users', user.uid);
          const usernameRef = doc(db, 'usernames', candidate);

          const [profileSnap, userSnap, snapshot] = await Promise.all([
            tx.get(profileRef),
            tx.get(userRef),
            tx.get(usernameRef),
          ]);

          const seedUser = () => {
            if (userSnap.exists()) return;
            tx.set(userRef, {
              email: user.email,
              preferences: storedPreferences,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              lastConnection: serverTimestamp(),
            });
          };

          if (profileSnap.exists()) {
            seedUser();
            return profileSnap.data().username as string;
          }

          if (snapshot.exists() && snapshot.data().uid !== user.uid) {
            throw new Error('USERNAME_TAKEN');
          }

          if (!snapshot.exists()) {
            tx.set(usernameRef, {
              uid: user.uid,
              createdAt: serverTimestamp(),
            });
          }

          seedUser();

          tx.set(profileRef, {
            username: candidate,
            displayName: user.displayName || candidate,
            bio: '',
            location: '',
            favoriteTeam: null,
            profileTheme: DEFAULT_PROFILE_THEME,
            streak: EMPTY_STREAK,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastConnection: serverTimestamp(),
          });

          return candidate;
        });

        return settled;
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
    if (await isUsernameTakenByOther(next, userId)) throw new Error('USERNAME_TAKEN');

    await runTransaction(db, async (tx) => {
      const nextRef = doc(db, 'usernames', next);
      const nextSnap = await tx.get(nextRef);

      if (nextSnap.exists() && nextSnap.data().uid !== userId) {
        throw new Error('USERNAME_TAKEN');
      }

      const profileRef = doc(db, 'profiles', userId);
      const current = (await tx.get(profileRef)).data()?.username as string | undefined;

      let currentOwnedByUser = false;
      if (current && current !== next) {
        const currentSnap = await tx.get(doc(db, 'usernames', current));
        currentOwnedByUser = currentSnap.exists() && currentSnap.data().uid === userId;
      }

      if (!nextSnap.exists()) {
        tx.set(nextRef, { uid: userId, createdAt: serverTimestamp() });
      }

      if (current !== next) {
        tx.update(profileRef, { username: next, updatedAt: serverTimestamp() });
      }

      if (currentOwnedByUser) {
        tx.delete(doc(db, 'usernames', current as string));
      }
    });

    return next;
  },

  async registerStreakDay(userId: string): Promise<UserStreak> {
    const today = localDayKey();
    const profileRef = doc(db, 'profiles', userId);

    return runTransaction(db, async (tx) => {
      const snapshot = await tx.get(profileRef);
      if (!snapshot.exists()) return EMPTY_STREAK;

      const stored = (snapshot.data().streak as UserStreak | undefined) ?? EMPTY_STREAK;
      const next = advanceStreak(stored, today);

      if (!next) return resolveStreak(stored, today);

      tx.update(profileRef, { streak: next, updatedAt: serverTimestamp() });

      return next;
    });
  },

  async exists(userId: string): Promise<boolean> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists();
  },

  async getProfile(userId: string): Promise<UserProfile | null> {
    const profileDoc = await getDoc(doc(db, 'profiles', userId));
    return profileDoc.exists() ? ({ ...profileDoc.data(), uid: userId } as UserProfile) : null;
  },

  async getProfileByUsername(rawUsername: string): Promise<UserProfile | null> {
    const username = normalizeUsername(rawUsername);
    if (!username) return null;

    const q = query(collection(db, 'profiles'), where('username', '==', username), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const profileDoc = snapshot.docs[0];
    return { ...profileDoc.data(), uid: profileDoc.id } as UserProfile;
  },

  async updateLastConnection(userId: string) {
    const batch = writeBatch(db);
    batch.update(doc(db, 'users', userId), { lastConnection: serverTimestamp() });
    batch.update(doc(db, 'profiles', userId), { lastConnection: serverTimestamp() });
    await batch.commit();
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
