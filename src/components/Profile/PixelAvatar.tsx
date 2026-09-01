'use client';

import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import tinycolor from 'tinycolor2';
import { jersey15 } from '@/assets/fonts/Jersey';

type ResponsiveSize = Record<string, number>;

interface Props {
  name?: string;
  color?: string;
  size?: ResponsiveSize;
  ring?: boolean;
}

const PIXEL_GRID =
  'repeating-linear-gradient(0deg, rgba(0,0,0,0.055) 0 1px, transparent 1px 8px), repeating-linear-gradient(90deg, rgba(0,0,0,0.055) 0 1px, transparent 1px 8px)';

const scale = (size: ResponsiveSize, factor: number, min = 1) =>
  Object.fromEntries(
    Object.entries(size).map(([key, value]) => [
      key,
      `${Math.max(min, Math.round(value * factor))}px`,
    ])
  );

export const getInitials = (name?: string) => {
  const parts = (name || '')
    .split(/[\s._-]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

export const PixelAvatar = ({
  name,
  color = '#8A94A6',
  size = { base: 120, sm: 148, md: 172 },
  ring = true,
}: Props) => {
  const base = tinycolor(color);
  const isDark = base.isDark();

  const surface = isDark ? base.clone().lighten(4).toString() : base.clone().saturate(4).toString();
  const frame = isDark ? base.clone().lighten(24).toString() : base.clone().darken(26).toString();
  const ink = isDark ? base.clone().lighten(54).toString() : base.clone().darken(50).toString();
  const inkShade = isDark
    ? base.clone().lighten(14).toString()
    : base.clone().darken(18).toString();

  const boxSize = scale(size, 1);
  const frameWidth = scale(size, 0.032, 3);
  const ringWidth = scale(size, 0.028, 3);
  const fontSize = scale(size, 0.72);
  const shadowOffset = scale(size, 0.026, 2);
  const textShadow = Object.fromEntries(
    Object.entries(shadowOffset).map(([key, value]) => [key, `${value} ${value} 0 ${inkShade}`])
  );

  return (
    <Box
      boxSize={boxSize}
      padding={ring ? ringWidth : 0}
      bg={ring ? 'bg.panel' : 'transparent'}
      borderRadius='full'
      flexShrink={0}
    >
      <Box boxSize='full' padding={frameWidth} bg={frame} borderRadius='full'>
        <Box
          boxSize='full'
          bg={surface}
          backgroundImage={PIXEL_GRID}
          borderRadius='full'
          display='flex'
          alignItems='center'
          justifyContent='center'
          overflow='hidden'
        >
          <Text
            className={jersey15.className}
            fontSize={fontSize}
            lineHeight='0.72'
            letterSpacing='0.02em'
            color={ink}
            textShadow={textShadow}
            userSelect='none'
            aria-hidden
          >
            {getInitials(name)}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};
