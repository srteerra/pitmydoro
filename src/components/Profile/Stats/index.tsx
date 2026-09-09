'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Box, Flex, SimpleGrid, Spinner, Tabs, Text, VStack } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { statsService } from '@/services/stats.service';
import { DailyStats } from '@/interfaces/Stats.interface';
import { formatSeconds } from '@/utils/formatSeconds.utils';
import {
  periodRange,
  ReportPeriod,
  ReportTotals,
  rollingYearRange,
  sumTotals,
} from '@/utils/statsReport.utils';
import { DEFAULT_PROFILE_THEME } from '@/utils/profileTheme.utils';
import { ProfileTheme } from '@/interfaces/ProfileTheme.interface';
import { StatsHeatmap } from '@/components/Profile/Stats/Heatmap';

const PERIODS = ['daily', 'weekly', 'monthly', 'annual'] as const;

type ProfilePeriod = (typeof PERIODS)[number];

const PERIOD_RANGE: Record<ProfilePeriod, ReportPeriod> = {
  daily: 'day',
  weekly: 'week',
  monthly: 'month',
  annual: 'year',
};

const METRICS = [
  'pomodoros',
  'workingTime',
  'breakTime',
  'pausedTime',
  'pauses',
  'tasksCompleted',
  'tasksCreated',
] as const;

type Metric = (typeof METRICS)[number];

const metricValue = (metric: Metric, totals: ReportTotals): string => {
  switch (metric) {
    case 'pomodoros':
      return `${totals.pomodoros}`;
    case 'workingTime':
      return formatSeconds(totals.workTime, 'duration');
    case 'breakTime':
      return formatSeconds(totals.breakTime, 'duration');
    case 'pausedTime':
      return formatSeconds(totals.pausedTime, 'duration');
    case 'pauses':
      return `${totals.pauses}`;
    case 'tasksCompleted':
      return `${totals.tasksCompleted}`;
    case 'tasksCreated':
      return `${totals.tasksCreated}`;
  }
};

const StatCard = ({ label, value, testId }: { label: string; value: string; testId: string }) => (
  <VStack data-pw-id={testId} align='start' gap={1} padding={4} borderRadius='xl' bg='bg.muted'>
    <Text fontSize='xs' color='fg.muted' truncate>
      {label}
    </Text>
    <Text fontSize='2xl' fontWeight='bold'>
      {value}
    </Text>
  </VStack>
);

interface Props {
  userId?: string;
  profileTheme?: ProfileTheme;
}

export const ProfileStats = ({ userId, profileTheme }: Props) => {
  const t = useTranslations('profile');

  const [stats, setStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(!!userId);

  const range = useMemo(() => rollingYearRange(), []);

  useEffect(() => {
    if (!userId) {
      setStats([]);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    (async () => {
      try {
        const result = await statsService.getDailyStatsRange(userId, range.from, range.to);
        if (active) setStats(result);
      } catch {
        if (active) setStats([]);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [userId, range.from, range.to]);

  const totalsByPeriod = useMemo(() => {
    return PERIODS.reduce(
      (acc, period) => {
        const { from, to } = periodRange(PERIOD_RANGE[period]);
        acc[period] = sumTotals(stats, from, to);
        return acc;
      },
      {} as Record<ProfilePeriod, ReportTotals>
    );
  }, [stats]);

  if (loading) {
    return (
      <Flex data-pw-id='profile-stats-loading' justify='center' align='center' minH='12rem'>
        <Spinner />
      </Flex>
    );
  }

  return (
    <>
      <StatsHeatmap
        stats={stats}
        from={range.from}
        to={range.to}
        accent={(profileTheme ?? DEFAULT_PROFILE_THEME).primary}
      />

      <Box data-pw-id='profile-stats' mt={8}>
        <Text fontWeight='bold' fontSize='lg' mb={4}>
          {t('stats')}
        </Text>

        <Tabs.Root defaultValue='daily' variant='line'>
          <Tabs.List>
            {PERIODS.map((period) => (
              <Tabs.Trigger key={period} data-pw-id={`profile-stats-tab-${period}`} value={period}>
                {t(period)}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {PERIODS.map((period) => (
            <Tabs.Content key={period} value={period}>
              <SimpleGrid columns={{ base: 2, md: 4 }} gap={3} mt={2}>
                {METRICS.map((metric) => (
                  <StatCard
                    key={metric}
                    testId={`profile-stat-${metric}`}
                    label={t(metric)}
                    value={metricValue(metric, totalsByPeriod[period])}
                  />
                ))}
              </SimpleGrid>
            </Tabs.Content>
          ))}
        </Tabs.Root>
      </Box>
    </>
  );
};
