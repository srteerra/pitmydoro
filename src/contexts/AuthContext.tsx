'use client';

import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { userService } from '@/services/user.service';
import useUserStore from '@/stores/User.store';
import { useOverlayStore } from '@/stores/Overlay.store';
import { useTasks } from '@/hooks/useTasks';
import { useSettings } from '@/hooks/useSettings';
import { useStickyNotes } from '@/hooks/useStickyNotes';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, username?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { fetchProfile, clearProfile } = useUserStore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { loadTasks, wipeTasks } = useTasks();
  const { loadConfig, wipeConfig } = useSettings();
  const { loadNotes, wipeNotes } = useStickyNotes();
  const pendingUsername = useRef<string | undefined>(undefined);
  const creationInFlight = useRef<Map<string, Promise<unknown>>>(new Map());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        try {
          const [existingUserData, existingProfile] = await Promise.all([
            userService.getUserData(user.uid),
            userService.getProfile(user.uid),
          ]);

          let userData = existingUserData;

          if (!userData || !existingProfile) {
            let creation = creationInFlight.current.get(user.uid);
            if (!creation) {
              creation = userService.create(user, pendingUsername.current);
              creationInFlight.current.set(user.uid, creation);
            }

            try {
              await creation;
            } finally {
              creationInFlight.current.delete(user.uid);
            }

            pendingUsername.current = undefined;
            userData = await userService.getUserData(user.uid);
          }

          loadConfig(userData?.preferences);
          useOverlayStore.getState().applySettings(userData?.overlay ?? null);

          await Promise.all([loadTasks(user.uid), fetchProfile(user.uid), loadNotes(user.uid)]);
          void userService.updateLastConnection(user.uid).catch((error) => {
            console.error('Failed to update last connection:', error);
          });
        } catch (error) {
          console.error('Failed to bootstrap authenticated session:', error);
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username?: string) => {
    pendingUsername.current = username;
    const result = await createUserWithEmailAndPassword(auth, email, password);

    if (result.user) {
      await sendEmailVerification(result.user);
    }
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    pendingUsername.current = undefined;
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth).then(async () => {
      setUser(null);
      await wipeTasks();
      await wipeConfig();
      await wipeNotes();
      clearProfile();
      useOverlayStore.getState().clear();
    });
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
