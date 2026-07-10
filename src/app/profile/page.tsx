'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import useUserStore from '@/stores/User.store';
import { Profile } from '@/components/Profile';
import { Loader } from '@/components/Loader';

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const profile = useUserStore((state) => state.profile);

  useEffect(() => {
    if (!user) {
      router.replace('/');
    }
  }, [user, router]);

  if (!user || !profile) return <Loader />;

  return <Profile profile={profile} isOwn />;
}
