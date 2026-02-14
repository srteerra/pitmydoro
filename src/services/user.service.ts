import {
  doc,
  getDoc,
  updateDoc,
  writeBatch,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { User } from 'firebase/auth';
import { DefaultSettings } from '@/constants/DefaultSettings';
import { Settings } from '@/interfaces/Settings.interface';

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
}

interface UserData {
  email: string;
  preferences: Settings;
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
    return profileDoc.exists() ? (profileDoc.data() as UserProfile) : null;
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
    await updateDoc(doc(db, 'users', userId), {
      preferences,
      updatedAt: serverTimestamp(),
    });
  },

  async checkUsernameAvailable(username: string): Promise<boolean> {
    const q = query(collection(db, 'profiles'), where('username', '==', username), limit(1));
    const snapshot = await getDocs(q);
    return snapshot.empty;
  },
};
