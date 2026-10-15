'use client';

import React from 'react';
import { HStack, Text } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';

interface Props {
  followersCount: number;
  followingCount: number;
}

const Counter = ({ value, label, pwId }: { value: number; label: string; pwId: string }) => (
  <HStack gap={1} data-pw-id={pwId}>
    <Text fontWeight='bold' fontVariantNumeric='tabular-nums'>
      {value}
    </Text>
    <Text color='fg.muted'>{label}</Text>
  </HStack>
);

export const FollowStats = ({ followersCount, followingCount }: Props) => {
  const t = useTranslations('social');

  return (
    <HStack gap={4} fontSize='sm'>
      <Counter
        pwId='profile-followers-count'
        value={followersCount}
        label={t('followers', { count: followersCount })}
      />
      <Counter
        pwId='profile-following-count'
        value={followingCount}
        label={t('followingCount', { count: followingCount })}
      />
    </HStack>
  );
};
