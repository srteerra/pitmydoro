'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { userService } from '@/services/user.service';
import { UserProfile } from '@/interfaces/UserProfile.interface';
import useUserStore from '@/stores/User.store';
import { Profile } from '@/components/Profile';
import { ProfileNotFound } from '@/components/Profile/ProfileNotFound';
import { Loader } from '@/components/Loader';

export const PublicProfileView = () => {
  const params = useParams();
  const router = useRouter();
  const ownUsername = useUserStore((state) => state.profile?.username);

  const username = decodeURIComponent(
    Array.isArray(params.username) ? params.username[0] : params.username || ''
  );

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ownUsername === username) {
      router.replace('/profile');
      return;
    }

    let active = true;

    (async () => {
      setLoading(true);
      try {
        const result = await userService.getProfileByUsername(username);
        if (active) setProfile(result);
      } catch {
        if (active) setProfile(null);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [username, ownUsername, router]);

  if (loading || ownUsername === username) return <Loader />;

  if (!profile) return <ProfileNotFound username={username} />;

  return <Profile profile={profile} userId={profile.uid} />;
};
