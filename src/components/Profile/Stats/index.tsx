'use client';

import React from 'react';
import { Box, SimpleGrid, Tabs, Text, VStack } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';

const PERIODS = ['daily', 'weekly', 'monthly', 'annual'] as const;

const MOCK = {
  workingTime: '—',
  breakTime: '—',
  pausedTime: '—',
  pauses: '—',
  tasksCompleted: '—',
  tasksCreated: '—',
};

const METRICS: (keyof typeof MOCK)[] = [
  'workingTime',
  'breakTime',
  'pausedTime',
  'pauses',
  'tasksCompleted',
  'tasksCreated',
];

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

export const ProfileStats = () => {
  const t = useTranslations('profile');

  return (
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
            <SimpleGrid columns={{ base: 2, md: 3 }} gap={3} mt={2}>
              {METRICS.map((metric) => (
                <StatCard
                  key={metric}
                  testId={`profile-stat-${metric}`}
                  label={t(metric)}
                  value={MOCK[metric]}
                />
              ))}
            </SimpleGrid>

            <Text fontSize='xs' color='fg.muted' mt={3}>
              {t('statsPlaceholder')}
            </Text>
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </Box>
  );
};
