'use client';

import React, { useMemo } from 'react';
import { Box, Flex, HStack, Image, Text, VStack } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { ConstructorEntry } from '@/interfaces/Leaderboard.interface';
import { formatSeconds } from '@/utils/formatSeconds.utils';
import { ConstructorRow, toConstructorRows } from '@/utils/constructors.utils';
import { RankBadge } from '@/components/Leaderboard/RankBadge';

interface Props {
  entries: ConstructorEntry[];
}

const TeamLogo = ({ row }: { row: ConstructorRow }) => (
  <Flex
    align='center'
    justify='center'
    boxSize={{ base: '2.75rem', md: '3.25rem' }}
    rounded='xl'
    bg={{ base: 'gray.50', _dark: 'gray.600' }}
    flexShrink={0}
  >
    <Image src={row.team.logoURL} alt={row.team.name} maxH='70%' maxW='70%' objectFit='contain' />
  </Flex>
);

const ConstructorItem = ({ row }: { row: ConstructorRow }) => {
  const t = useTranslations('leaderboard.constructors');

  return (
    <HStack
      data-pw-id={`constructors-row-${row.rank}`}
      gap={3}
      px={4}
      py={row.rank === 1 ? 4 : 3}
      rounded='xl'
      bg='bg.muted'
    >
      <RankBadge rank={row.rank} />
      <TeamLogo row={row} />

      <Box flex={1} minW={0}>
        <Text fontWeight='semibold' fontSize={row.rank === 1 ? 'lg' : 'md'} truncate>
          {row.team.name}
        </Text>
        <Text fontSize='xs' color='fg.muted'>
          {t('drivers', { count: row.drivers })}
        </Text>
      </Box>

      <Text fontWeight='bold' fontVariantNumeric='tabular-nums' flexShrink={0}>
        {formatSeconds(row.pomodoroTime, 'hoursMinutes')}
      </Text>
    </HStack>
  );
};

export const ConstructorsTable = ({ entries }: Props) => {
  const t = useTranslations('leaderboard');
  const rows = useMemo(() => toConstructorRows(entries), [entries]);

  if (rows.length === 0) {
    return (
      <Flex data-pw-id='constructors-empty' justify='center' align='center' minH='10rem'>
        <Text color='fg.muted'>{t('constructors.empty')}</Text>
      </Flex>
    );
  }

  return (
    <VStack data-pw-id='constructors-table' align='stretch' gap={2} mt={4}>
      <HStack px={4} color='fg.muted' fontSize='xs' textTransform='uppercase' letterSpacing='wide'>
        <Text minW='2.25rem'>{t('rank')}</Text>
        <Text flex={1}>{t('constructors.team')}</Text>
        <Text>{t('focusTime')}</Text>
      </HStack>

      {rows.map((row) => (
        <ConstructorItem key={row.teamId} row={row} />
      ))}
    </VStack>
  );
};
