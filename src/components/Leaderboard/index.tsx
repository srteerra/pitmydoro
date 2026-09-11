'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Container, Flex, HStack, Spinner, Tabs, Text, VStack } from '@chakra-ui/react';
import { useLocale, useTranslations } from 'next-intl';
import { leaderboardService } from '@/services/leaderboard.service';
import {
  CurrentLeaderboards,
  LeaderboardPeriodType,
  LeaderboardSnapshot,
} from '@/interfaces/Leaderboard.interface';
import { timestampUtils } from '@/utils/timestamp.utils';
import { LeaderboardTable } from '@/components/Leaderboard/LeaderboardTable';
import { jersey15 } from '@/assets/fonts/Jersey';
import { InDevelopmentBadge } from '@/components/InDevelopmentBadge';

const PERIODS: LeaderboardPeriodType[] = ['weekly', 'monthly'];

const relativeTime = (locale: string, ms: number): string => {
  if (!ms) return '';

  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const minutes = Math.round((ms - Date.now()) / 60_000);

  if (Math.abs(minutes) < 60) return formatter.format(minutes, 'minute');

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return formatter.format(hours, 'hour');

  return formatter.format(Math.round(hours / 24), 'day');
};

const formatPeriod = (locale: string, snapshot: LeaderboardSnapshot): string => {
  const formatter = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });

  return `${formatter.format(new Date(`${snapshot.from}T00:00:00Z`))} – ${formatter.format(
    new Date(`${snapshot.to}T00:00:00Z`)
  )}`;
};

const PeriodPanel = ({ snapshot }: { snapshot: LeaderboardSnapshot }) => {
  const t = useTranslations('leaderboard');
  const locale = useLocale();

  const updated = relativeTime(locale, timestampUtils.toMillis(snapshot.computedAt));

  return (
    <VStack align='stretch' gap={0}>
      <HStack gap={3} wrap='wrap' color='fg.muted' fontSize='sm'>
        <Text>{formatPeriod(locale, snapshot)}</Text>
        <Text>·</Text>
        <Text>{t('participants', { count: snapshot.participants })}</Text>
        {updated && (
          <>
            <Text>·</Text>
            <Text>{t('updated', { time: updated })}</Text>
          </>
        )}
        {snapshot.sealed && (
          <Badge colorPalette='green' variant='subtle'>
            {t('sealed')}
          </Badge>
        )}
      </HStack>

      <LeaderboardTable entries={snapshot.top ?? []} />
    </VStack>
  );
};

export const Leaderboard = () => {
  const t = useTranslations('leaderboard');

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

  return (
    <Container maxW='3xl' py={{ base: 10, md: 16 }}>
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
          <InDevelopmentBadge />
        </Flex>
        <Text fontSize={{ base: 'md', md: 'lg' }} color='fg.muted'>
          {t('subtitle')}
        </Text>
      </VStack>

      {loading && (
        <Flex data-pw-id='leaderboard-loading' justify='center' align='center' minH='12rem'>
          <Spinner />
        </Flex>
      )}

      {!loading && (failed || !data) && (
        <Flex data-pw-id='leaderboard-error' justify='center' align='center' minH='12rem'>
          <Text color='fg.muted'>{failed ? t('error') : t('empty')}</Text>
        </Flex>
      )}

      {!loading && !failed && data && (
        <Tabs.Root defaultValue='weekly' variant='line'>
          <Tabs.List>
            {PERIODS.map((period) => (
              <Tabs.Trigger key={period} data-pw-id={`leaderboard-tab-${period}`} value={period}>
                {t(period)}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {PERIODS.map((period) => (
            <Tabs.Content key={period} value={period} pt={4}>
              {snapshots[period] ? (
                <PeriodPanel snapshot={snapshots[period]} />
              ) : (
                <Text color='fg.muted'>{t('empty')}</Text>
              )}
            </Tabs.Content>
          ))}
        </Tabs.Root>
      )}
    </Container>
  );
};
