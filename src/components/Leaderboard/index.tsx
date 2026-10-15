'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Container, Flex, SegmentGroup, Spinner, Tabs, Text, VStack } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { IconType } from 'react-icons';
import { LuCarFront, LuUsers } from 'react-icons/lu';
import { leaderboardService } from '@/services/leaderboard.service';
import {
  CurrentLeaderboards,
  LeaderboardPeriodType,
  LeaderboardSnapshot,
} from '@/interfaces/Leaderboard.interface';
import { LeaderboardTable } from '@/components/Leaderboard/LeaderboardTable';
import { ConstructorsTable } from '@/components/Leaderboard/ConstructorsTable';
import { PeriodPanel } from '@/components/Leaderboard/PeriodPanel';
import { FriendsPanel } from '@/components/Leaderboard/FriendsPanel';
import { jersey15 } from '@/assets/fonts/Jersey';
import { useAuth } from '@/contexts/AuthContext';
import { useFriendsLeaderboard } from '@/hooks/useFriendsLeaderboard';
import { LeaderboardScopeEnum } from '@/enums/LeaderboardScope.enum';
import { LeaderboardBoardEnum } from '@/enums/LeaderboardBoard.enum';

const PERIODS: LeaderboardPeriodType[] = ['weekly', 'monthly'];

const BOARDS: LeaderboardBoardEnum[] = [
  LeaderboardBoardEnum.USERS,
  LeaderboardBoardEnum.CONSTRUCTORS,
];

const BOARD_ICONS: Record<LeaderboardBoardEnum, IconType> = {
  [LeaderboardBoardEnum.USERS]: LuUsers,
  [LeaderboardBoardEnum.CONSTRUCTORS]: LuCarFront,
};

const SCOPES: LeaderboardScopeEnum[] = [LeaderboardScopeEnum.GLOBAL, LeaderboardScopeEnum.FRIENDS];

const ScopeSwitch = ({
  scope,
  onChange,
}: {
  scope: LeaderboardScopeEnum;
  onChange: (scope: LeaderboardScopeEnum) => void;
}) => {
  const t = useTranslations('leaderboard.scopes');

  return (
    <SegmentGroup.Root
      size='sm'
      value={scope}
      onValueChange={(details) => onChange(details.value as LeaderboardScopeEnum)}
    >
      <SegmentGroup.Indicator />
      {SCOPES.map((item) => (
        <SegmentGroup.Item
          key={item}
          value={item}
          cursor='pointer'
          data-pw-id={`leaderboard-scope-${item}`}
        >
          <SegmentGroup.ItemText>{t(item)}</SegmentGroup.ItemText>
          <SegmentGroup.ItemHiddenInput />
        </SegmentGroup.Item>
      ))}
    </SegmentGroup.Root>
  );
};

const useCurrentLeaderboards = () => {
  const [data, setData] = useState<CurrentLeaderboards | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const result = await leaderboardService.getCurrent();
        if (active) setData(result);
      } catch {
        if (active) setFailed(true);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const snapshots = useMemo(
    () =>
      ({
        weekly: data?.weekly,
        monthly: data?.monthly,
      }) as Record<LeaderboardPeriodType, LeaderboardSnapshot | undefined>,
    [data]
  );

  return { data, snapshots, loading, failed };
};

const BoardTabs = ({
  board,
  onChange,
}: {
  board: LeaderboardBoardEnum;
  onChange: (board: LeaderboardBoardEnum) => void;
}) => {
  const t = useTranslations('leaderboard.boards');

  return (
    <Tabs.Root
      value={board}
      onValueChange={(details) => onChange(details.value as LeaderboardBoardEnum)}
      variant='enclosed'
      size='sm'
    >
      <Tabs.List>
        {BOARDS.map((item) => {
          const Icon = BOARD_ICONS[item];
          return (
            <Tabs.Trigger key={item} value={item} data-pw-id={`leaderboard-board-${item}`}>
              <Icon />
              {t(item)}
            </Tabs.Trigger>
          );
        })}
      </Tabs.List>
    </Tabs.Root>
  );
};

const subtitleKey = (board: LeaderboardBoardEnum, isFriendsScope: boolean) => {
  if (board === LeaderboardBoardEnum.CONSTRUCTORS) return 'constructors.subtitle';
  return isFriendsScope ? 'friends.subtitle' : 'subtitle';
};

export const Leaderboard = () => {
  const t = useTranslations('leaderboard');
  const { user } = useAuth();
  const [board, setBoard] = useState<LeaderboardBoardEnum>(LeaderboardBoardEnum.USERS);
  const [scope, setScope] = useState<LeaderboardScopeEnum>(LeaderboardScopeEnum.GLOBAL);
  const isUsersBoard = board === LeaderboardBoardEnum.USERS;
  const isFriendsScope = isUsersBoard && !!user && scope === LeaderboardScopeEnum.FRIENDS;
  const friends = useFriendsLeaderboard(isFriendsScope);
  const { data, snapshots, loading, failed } = useCurrentLeaderboards();

  const renderPeriod = (period: LeaderboardPeriodType) => {
    if (isFriendsScope && user) {
      return <FriendsPanel period={period} viewerUid={user.uid} {...friends} />;
    }

    const snapshot = snapshots[period];
    if (!snapshot) return <Text color='fg.muted'>{t('empty')}</Text>;

    return (
      <PeriodPanel snapshot={snapshot}>
        {isUsersBoard ? (
          <LeaderboardTable entries={snapshot.top ?? []} highlightUid={user?.uid} />
        ) : (
          <ConstructorsTable entries={snapshot.constructors ?? []} />
        )}
      </PeriodPanel>
    );
  };

  return (
    <Container
      maxW='3xl'
      py={{ base: 10, md: 16 }}
      minH={{ base: 'calc(100vh - 72px)', lg: 'calc(100vh - 100px)' }}
    >
      <VStack as='header' align='flex-start' gap={3} mb={{ base: 8, md: 10 }}>
        <Flex align='center' gap={3} mb={1}>
          <Text
            as='h1'
            fontSize={{ base: '4xl', md: '6xl' }}
            lineHeight={1.05}
            fontWeight='bold'
            className={jersey15.className}
          >
            {t('title')}
          </Text>
        </Flex>
        <Text fontSize={{ base: 'md', md: 'lg' }} color='fg.muted'>
          {t(subtitleKey(board, isFriendsScope))}
        </Text>
        <BoardTabs board={board} onChange={setBoard} />
      </VStack>

      {!isFriendsScope && loading && (
        <Flex data-pw-id='leaderboard-loading' justify='center' align='center' minH='12rem'>
          <Spinner />
        </Flex>
      )}

      {!isFriendsScope && !loading && (failed || !data) && (
        <Flex data-pw-id='leaderboard-error' justify='center' align='center' minH='12rem'>
          <Text color='fg.muted'>{failed ? t('error') : t('empty')}</Text>
        </Flex>
      )}

      {(isFriendsScope || (!loading && !failed && data)) && (
        <Tabs.Root defaultValue='weekly' variant='line'>
          <Flex align='center' justify='space-between' gap={3}>
            <Tabs.List flex={1}>
              {PERIODS.map((period) => (
                <Tabs.Trigger key={period} data-pw-id={`leaderboard-tab-${period}`} value={period}>
                  {t(period)}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
            {isUsersBoard && user && <ScopeSwitch scope={scope} onChange={setScope} />}
          </Flex>

          {PERIODS.map((period) => (
            <Tabs.Content key={period} value={period} pt={4}>
              {renderPeriod(period)}
            </Tabs.Content>
          ))}
        </Tabs.Root>
      )}
    </Container>
  );
};
