'use client';

import React from 'react';
import { Button, HStack, IconButton } from '@chakra-ui/react';
import { LuStar, LuUserCheck, LuUserPlus } from 'react-icons/lu';
import { useTranslations } from 'next-intl';
import { Tooltip } from '@/components/ui/tooltip';

interface Props {
  isFollowing: boolean;
  isFavorite: boolean;
  loading: boolean;
  pending: boolean;
  onToggleFollow: () => void;
  onToggleFavorite: () => void;
}

export const FollowActions = ({
  isFollowing,
  isFavorite,
  loading,
  pending,
  onToggleFollow,
  onToggleFavorite,
}: Props) => {
  const t = useTranslations('social');
  const favoriteLabel = isFavorite ? t('removeFavorite') : t('addFavorite');

  return (
    <HStack gap={2}>
      {isFollowing && (
        <Tooltip content={favoriteLabel} openDelay={200} closeDelay={100}>
          <IconButton
            data-pw-id='profile-favorite-button'
            aria-label={favoriteLabel}
            aria-pressed={isFavorite}
            onClick={onToggleFavorite}
            disabled={pending}
            variant='outline'
            rounded='full'
            color={isFavorite ? 'yellow.500' : 'fg.muted'}
          >
            <LuStar fill={isFavorite ? 'currentColor' : 'none'} />
          </IconButton>
        </Tooltip>
      )}

      <Button
        data-pw-id='profile-follow-button'
        onClick={onToggleFollow}
        loading={loading || pending}
        variant={isFollowing ? 'outline' : 'solid'}
        rounded='full'
        size='md'
        px={6}
      >
        {isFollowing ? <LuUserCheck /> : <LuUserPlus />}
        {isFollowing ? t('following') : t('follow')}
      </Button>
    </HStack>
  );
};
