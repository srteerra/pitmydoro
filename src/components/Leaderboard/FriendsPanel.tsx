'use client';

import React, { useMemo } from 'react';
import { Flex, HStack, Spinner, Text, VStack } from '@chakra-ui/react';
import { LuStar } from 'react-icons/lu';
import { useTranslations } from 'next-intl';
import { LeaderboardPeriodType } from '@/interfaces/Leaderboard.interface';
import { FriendStanding, toLeaderboardEntries } from '@/services/friendsLeaderboard.service';
import { LeaderboardTable } from '@/components/Leaderboard/LeaderboardTable';
import { MAX_FAVORITES } from '@/constants/Social';
import { HelpTip } from '@/components/ui/help-tip';

interface Props {
  period: LeaderboardPeriodType;
  viewerUid: string;
  standings: FriendStanding[];
  favoritesCount: number;
  loading: boolean;
  failed: boolean;
}

const CenteredMessage = ({ pwId, children }: { pwId: string; children: React.ReactNode }) => (
  <Flex data-pw-id={pwId} justify='center' align='center' minH='10rem' textAlign='center'>
    {children}
  </Flex>
);

export const FriendsPanel = ({
  period,
  viewerUid,
  standings,
  favoritesCount,
  loading,
  failed,
}: Props) => {
  const t = useTranslations('leaderboard.friends');
  const entries = useMemo(() => toLeaderboardEntries(standings, period), [standings, period]);

  if (loading) {
    return (
      <CenteredMessage pwId='friends-leaderboard-loading'>
        <Spinner />
      </CenteredMessage>
    );
  }

  if (failed) {
    return (
      <CenteredMessage pwId='friends-leaderboard-error'>
        <Text color='fg.muted'>{t('error')}</Text>
      </CenteredMessage>
    );
  }

  return (
    <VStack align='stretch' gap={0}>
      <HStack color='fg.muted' fontSize='sm' gap={1.5}>
        <LuStar />
        <Text data-pw-id='friends-leaderboard-favorites'>
          {t('favorites', { count: favoritesCount, max: MAX_FAVORITES })}
        </Text>
        <HelpTip content={t('hint')} placement='top' />
      </HStack>

      <LeaderboardTable
        entries={entries}
        highlightUid={viewerUid}
        showGapToViewer
        emptyLabel={t('empty')}
      />
    </VStack>
  );
};
