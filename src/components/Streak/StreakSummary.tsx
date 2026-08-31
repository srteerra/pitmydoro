'use client';

import React from 'react';
import { Box, Circle, HStack, Text, VStack } from '@chakra-ui/react';
import { LuFlame } from 'react-icons/lu';
import { useTranslations } from 'next-intl';
import { useStreak } from '@/hooks/useStreak';

export const StreakSummary = () => {
  const t = useTranslations('streak');
  const { current, activeToday } = useStreak();

  return (
    <Box paddingX={3} paddingY={2.5} minW='232px'>
      <HStack gap={3} align='center'>
        <Circle
          size='38px'
          bg={activeToday ? 'orange.subtle' : 'bg.muted'}
          color={activeToday ? 'orange.fg' : 'fg.muted'}
          fontSize='lg'
        >
          <LuFlame />
        </Circle>

        <VStack gap={0} align='stretch' flex='1' minW={0}>
          <HStack gap={2} align='baseline'>
            <Text fontSize='xl' fontWeight='bold' lineHeight='1'>
              {current}
            </Text>
            <Text fontSize='sm' color='fg.muted'>
              {t('daysCount', { count: current })}
            </Text>
          </HStack>
          <Text fontSize='xs' color='fg.muted'>
            {activeToday ? t('doneToday') : t('pendingToday')}
          </Text>
        </VStack>
      </HStack>
    </Box>
  );
};
