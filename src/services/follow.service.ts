import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Follow } from '@/interfaces/Follow.interface';

const followingCollection = (followerId: string) =>
  collection(db, 'users', followerId, 'following');

const followRef = (followerId: string, followeeId: string) =>
  doc(db, 'users', followerId, 'following', followeeId);

const favoritesQuery = (followerId: string) =>
  query(followingCollection(followerId), where('favorite', '==', true));

export const followService = {
  async getFollow(followerId: string, followeeId: string): Promise<Follow | null> {
    const snapshot = await getDoc(followRef(followerId, followeeId));
    return snapshot.exists() ? (snapshot.data() as Follow) : null;
  },

  async follow(followerId: string, followeeId: string) {
    await setDoc(followRef(followerId, followeeId), {
      uid: followeeId,
      favorite: false,
      createdAt: serverTimestamp(),
    });
  },

  async unfollow(followerId: string, followeeId: string) {
    await deleteDoc(followRef(followerId, followeeId));
  },

  async setFavorite(followerId: string, followeeId: string, favorite: boolean) {
    await updateDoc(followRef(followerId, followeeId), {
      favorite,
      updatedAt: serverTimestamp(),
    });
  },

  async countFavorites(followerId: string): Promise<number> {
    const snapshot = await getCountFromServer(favoritesQuery(followerId));
    return snapshot.data().count;
  },

  async getFavoriteIds(followerId: string): Promise<string[]> {
    const snapshot = await getDocs(favoritesQuery(followerId));
    return snapshot.docs.map((snap) => snap.id);
  },
};
