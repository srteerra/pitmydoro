'use client';

import React from 'react';
import { Box, BoxProps } from '@chakra-ui/react';

const HEX_CLIP = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
const HEX_RATIO = 2 / Math.sqrt(3);

interface Props extends BoxProps {
  size: number;
  children: React.ReactNode;
}

export const BadgeHex = ({ size, children, ...rest }: Props) => (
  <Box
    display='flex'
    alignItems='center'
    justifyContent='center'
    flexShrink={0}
    w={`${size}px`}
    h={`${size * HEX_RATIO}px`}
    clipPath={HEX_CLIP}
    bg='bg.emphasized'
    color='fg.muted'
    {...rest}
  >
    {children}
  </Box>
);
