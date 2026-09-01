'use client';

import React from 'react';
import { HStack, Text } from '@chakra-ui/react';
import { LuFlame } from 'react-icons/lu';
import { useTranslations } from 'next-intl';
import { Tooltip } from '@/components/ui/tooltip';
import { useStreak } from '@/hooks/useStreak';

export const StreakBadge = () => {
  const t = useTranslations('streak');
  const { current, activeToday } = useStreak();

  if (current <= 0) return null;

  return (
    <Tooltip
      openDelay={100}
      closeDelay={100}
      content={activeToday ? t('activeTooltip', { count: current }) : t('pendingTooltip')}
    >
      <HStack
        data-pw-id='streak-badge'
        gap={1}
        paddingX={2.5}
        paddingY={1}
        rounded='full'
        borderWidth='1px'
        cursor='default'
        bg={activeToday ? 'orange.subtle' : 'bg.muted'}
        color={activeToday ? 'orange.fg' : 'fg.muted'}
        borderColor={activeToday ? 'orange.emphasized' : 'border'}
        aria-label={t('daysCount', { count: current })}
      >
        <LuFlame />
        <Text data-pw-id='streak-badge-count' fontSize='sm' fontWeight='bold' lineHeight='1'>
          {current}
        </Text>
      </HStack>
    </Tooltip>
  );
};
