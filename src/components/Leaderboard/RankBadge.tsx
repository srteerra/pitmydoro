'use client';

import React from 'react';
import { Flex } from '@chakra-ui/react';

const PODIUM: Record<number, string> = {
  1: '#e3d19f',
  2: '#dadbde',
  3: '#c5b59e',
};

export const RankBadge = ({ rank }: { rank: number }) => {
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
