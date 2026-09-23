'use client';

import React from 'react';
import { Avatar, Box, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { LeaderboardEntry } from '@/interfaces/Leaderboard.interface';
import { formatSeconds } from '@/utils/formatSeconds.utils';
import { resolveFeaturedBadge } from '@/utils/badges.utils';
import { BadgeFlat } from '@/components/Profile/Badges/BadgeFlat';
import { FlagTooltip } from '@/components/ui/flag-tooltip';

const BADGE_SIZE = 16;

const PODIUM: Record<number, string> = {
  1: '#D4AF37',
  2: '#A8A9AD',
  3: '#B08D57',
};

const EntryBadge = ({ entry }: { entry: LeaderboardEntry }) => {
  const t = useTranslations('badges');

  const badge = resolveFeaturedBadge(entry.badges, entry.featuredBadge);

  if (!badge) return null;

  return (
    <BadgeFlat
      data-pw-id={`leaderboard-badge-${badge.id}`}
      aria-label={t(`${badge.id}.name`)}
      size={BADGE_SIZE}
      color={badge.color}
      glyph={badge.glyph}
    />
  );
};

const RankBadge = ({ rank }: { rank: number }) => {
  const accent = PODIUM[rank];

  return (
    <Flex
      align='center'
      justify='center'
      minW='2.25rem'
      h='2.25rem'
      rounded='lg'
      flexShrink={0}
      bg={accent ? accent : 'bg.muted'}
      color={accent ? 'black' : 'fg.muted'}
      fontWeight='bold'
      fontSize={accent ? 'md' : 'sm'}
    >
      {rank}
    </Flex>
  );
};

interface Props {
  entries: LeaderboardEntry[];
}

export const LeaderboardTable = ({ entries }: Props) => {
  const t = useTranslations('leaderboard');

  if (entries.length === 0) {
    return (
      <Flex data-pw-id='leaderboard-empty' justify='center' align='center' minH='10rem'>
        <Text color='fg.muted'>{t('empty')}</Text>
      </Flex>
    );
  }

  return (
    <VStack data-pw-id='leaderboard-table' align='stretch' gap={2} mt={4}>
      <HStack px={4} color='fg.muted' fontSize='xs' textTransform='uppercase' letterSpacing='wide'>
        <Text minW='2.25rem'>{t('rank')}</Text>
        <Text flex={1}>{t('user')}</Text>
        <Text>{t('focusTime')}</Text>
      </HStack>

      {entries.map((entry) => (
        <Link key={entry.uid} href={`/profile/${entry.username}`} aria-label={entry.displayName}>
          <HStack
            data-pw-id={`leaderboard-row-${entry.rank}`}
            gap={3}
            px={4}
            py={3}
            rounded='xl'
            bg='bg.muted'
            transition='background 0.15s ease'
            _hover={{ bg: 'bg.emphasized' }}
          >
            <RankBadge rank={entry.rank} />

            <Avatar.Root size='sm' borderRadius='full' flexShrink={0}>
              <Avatar.Fallback name={entry.displayName} />
              {entry.photoURL && <Avatar.Image src={entry.photoURL} alt={entry.displayName} />}
            </Avatar.Root>

            <Box flex={1} minW={0}>
              <HStack gap={2}>
                <Text fontWeight='semibold' truncate>
                  {entry.displayName}
                </Text>
                <EntryBadge entry={entry} />
                {entry.favoriteFlag && (
                  <FlagTooltip flag={entry.favoriteFlag}>
                    <Text fontSize='sm'>{entry.favoriteFlag}</Text>
                  </FlagTooltip>
                )}
              </HStack>
              <Text fontSize='xs' color='fg.muted' truncate>
                @{entry.username}
              </Text>
            </Box>

            <Text fontWeight='bold' fontVariantNumeric='tabular-nums' flexShrink={0}>
              {formatSeconds(entry.pomodoroTime ?? entry.workTime ?? 0, 'duration')}
            </Text>
          </HStack>
        </Link>
      ))}
    </VStack>
  );
};
