import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
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

async function generateUniqueUsername(email: string): Promise<string> {
  const base = email
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  let username = base;
  let counter = 1;

  while (true) {
    const q = query(collection(db, 'profiles'), where('username', '==', username), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return username;
    }

    username = `${base}${counter}`;
    counter++;
  }
}

export const userService = {
  async create(user: User) {
    const batch = writeBatch(db);

    const stored = localStorage.getItem(STORAGE_SETTINGS_KEY);
    const storedPreferences = stored ? JSON.parse(stored) : DefaultSettings;

    const userRef = doc(db, 'users', user.uid);
    batch.set(userRef, {
      email: user.email,
      preferences: storedPreferences,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const username = await generateUniqueUsername(user.email || 'user');
    const profileRef = doc(db, 'profiles', user.uid);

    batch.set(profileRef, {
      username: username,
      displayName: user.displayName || username,
      bio: '',
      photoURL: user.photoURL || '',
      coverURL: '',
      location: '',
      favoriteTeam: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
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
