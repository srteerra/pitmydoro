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
import { RankBadge } from '@/components/Leaderboard/RankBadge';

const BADGE_SIZE = 16;

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

interface Props {
  entries: LeaderboardEntry[];
  highlightUid?: string;
  showGapToViewer?: boolean;
  emptyLabel?: string;
}

const VIEWER_PALETTE = 'blue';

const entryTime = (entry: LeaderboardEntry) => entry.pomodoroTime ?? entry.workTime ?? 0;

const GapToViewer = ({ seconds }: { seconds: number }) => {
  if (seconds === 0) return null;

  return (
    <Text fontSize='xs' color={seconds > 0 ? 'red.500' : 'green.500'} textAlign='end'>
      {`${seconds > 0 ? '+' : '-'}${formatSeconds(Math.abs(seconds), 'hoursMinutes')}`}
    </Text>
  );
};

export const LeaderboardTable = ({
  entries,
  highlightUid,
  showGapToViewer = false,
  emptyLabel,
}: Props) => {
  const t = useTranslations('leaderboard');
  const viewerEntry = highlightUid ? entries.find((entry) => entry.uid === highlightUid) : null;
  const gapBase = showGapToViewer ? viewerEntry : null;

  if (entries.length === 0) {
    return (
      <Flex data-pw-id='leaderboard-empty' justify='center' align='center' minH='10rem'>
        <Text color='fg.muted'>{emptyLabel ?? t('empty')}</Text>
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
            data-viewer={entry.uid === highlightUid || undefined}
            gap={3}
            px={4}
            py={3}
            rounded='xl'
            colorPalette={entry.uid === highlightUid ? VIEWER_PALETTE : undefined}
            bg={entry.uid === highlightUid ? 'colorPalette.subtle' : 'bg.muted'}
            transition='background 0.15s ease'
            _hover={{ bg: entry.uid === highlightUid ? 'colorPalette.muted' : 'bg.emphasized' }}
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

            <Box flexShrink={0} textAlign='end'>
              <Text fontWeight='bold' fontVariantNumeric='tabular-nums'>
                {formatSeconds(entryTime(entry), 'hoursMinutes')}
              </Text>
              {gapBase && entry.uid !== highlightUid && (
                <GapToViewer seconds={entryTime(entry) - entryTime(gapBase)} />
              )}
            </Box>
          </HStack>
        </Link>
      ))}
    </VStack>
  );
};
