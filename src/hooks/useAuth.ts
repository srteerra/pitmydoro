import {
  createUserWithEmailAndPassword as _createUserWithEmailAndPassword,
  signInWithEmailAndPassword as _signInWithEmailAndPassword,
  signOut as _signOut,
} from 'firebase/auth';
import { useEffect, useState } from 'react';
import { onAuthStateChanged as _onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/config';

export default function useFirebaseAuth() {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clear = () => {
    setAuthUser(null);
    setLoading(true);
  };

  const authStateChanged = async (authState: any) => {
    if (!authState) {
      setLoading(false)
      return;
    }

    setLoading(true)
    setAuthUser(authState);
    setLoading(false);
  };

  const signInWithEmailAndPassword = (email: any, password: any) =>
    _signInWithEmailAndPassword(auth, email, password);

  const createUserWithEmailAndPassword = (email: any, password: any) =>
    _createUserWithEmailAndPassword(auth, email, password);

  const signOut = () => _signOut(auth).then(clear);

  const onAuthStateChanged = (cb: any) => {
    return _onAuthStateChanged(auth, cb);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authStateChanged);
    return () => unsubscribe();
  }, []);

  return {
    authUser,
    loading,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
  };
}
