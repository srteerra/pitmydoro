'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Center, Text, VStack } from '@chakra-ui/react';
import { useTranslations } from 'use-intl';
import { userService } from '@/services/user.service';
import { UserProfile } from '@/interfaces/UserProfile.interface';
import useUserStore from '@/stores/User.store';
import { Profile } from '@/components/Profile';
import { Loader } from '@/components/Loader';

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('profile');
  const ownProfile = useUserStore((state) => state.profile);

  const username = decodeURIComponent(
    Array.isArray(params.username) ? params.username[0] : params.username || ''
  );

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ownProfile && ownProfile.username === username) {
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
  }, [username, ownProfile, router]);

  if (loading || (ownProfile && ownProfile.username === username)) return <Loader />;

  if (!profile) {
    return (
      <Center minH='60vh' px={6} data-pw-id='profile-not-found'>
        <VStack gap={5} textAlign='center'>
          <Text fontSize='xl' fontWeight='bold'>
            {t('notFoundTitle')}
          </Text>
          <Text opacity={0.7}>{t('notFoundDescription', { username })}</Text>
          <Button
            borderRadius='full'
            size='lg'
            onClick={() => router.push('/')}
            data-pw-id='profile-not-found-home'
          >
            {t('goHome')}
          </Button>
        </VStack>
      </Center>
    );
  }

  return <Profile profile={profile} />;
}
