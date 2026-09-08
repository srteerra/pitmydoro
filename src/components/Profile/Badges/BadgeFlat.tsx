'use client';

import React, { useId } from 'react';
import { Box, BoxProps } from '@chakra-ui/react';
import tinycolor from 'tinycolor2';
import { BadgeGlyph } from '@/interfaces/Badge.interface';
import { BadgeGlyphShapes } from '@/components/Profile/Badges/BadgeGlyphShapes';

const R = 57.735;
const HALF_R = R / 2;
const HEX_RATIO = 2 / Math.sqrt(3);
const GLYPH_EXTENT = 52;

const HEX_VERTICES: [number, number][] = [
  [0, -R],
  [50, -HALF_R],
  [50, HALF_R],
  [0, R],
  [-50, HALF_R],
  [-50, -HALF_R],
];

const hexPath = (scale: number) =>
  `${HEX_VERTICES.map(
    ([x, y], index) =>
      `${index === 0 ? 'M' : 'L'}${(x * scale).toFixed(2)} ${(y * scale).toFixed(2)}`
  ).join('')}Z`;

const RIM_PATH = hexPath(1);
const FACE_PATH = hexPath(0.82);
const INNER_PATH = hexPath(0.66);

const GLYPH_TRANSFORM = `scale(${(GLYPH_EXTENT / 24).toFixed(4)}) translate(-12 -12)`;

interface Props extends Omit<BoxProps, 'color'> {
  size: number;
  glyph: BadgeGlyph;
  color?: string;
  muted?: boolean;
}

export const BadgeFlat = ({ size, glyph, color, muted = false, ...rest }: Props) => {
  const uid = useId().replace(/:/g, '');

  const base = tinycolor(color ?? '#94A3B8');
  const tone = muted || !color ? base.desaturate(100).darken(2) : base;

  const rimId = `badge-rim-${uid}`;
  const faceId = `badge-face-${uid}`;
  const glossId = `badge-gloss-${uid}`;

  return (
    <Box
      display='flex'
      alignItems='center'
      justifyContent='center'
      flexShrink={0}
      lineHeight='0'
      w={`${size}px`}
      h={`${size * HEX_RATIO}px`}
      opacity={muted ? 0.6 : 1}
      {...rest}
    >
      <svg
        width={size}
        height={size * HEX_RATIO}
        viewBox={`-50 ${-R} 100 ${R * 2}`}
        aria-hidden
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={rimId} x1='0' y1='0' x2='0.6' y2='1'>
            <stop offset='0%' stopColor={tone.clone().lighten(24).toString()} />
            <stop offset='100%' stopColor={tone.clone().darken(22).toString()} />
          </linearGradient>
          <linearGradient id={faceId} x1='0' y1='0' x2='0.4' y2='1'>
            <stop offset='0%' stopColor={tone.clone().lighten(10).toString()} />
            <stop offset='100%' stopColor={tone.clone().darken(14).toString()} />
          </linearGradient>
          <linearGradient id={glossId} x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0%' stopColor='#ffffff' stopOpacity='0.42' />
            <stop offset='52%' stopColor='#ffffff' stopOpacity='0.04' />
            <stop offset='100%' stopColor='#ffffff' stopOpacity='0' />
          </linearGradient>
        </defs>

        <path d={RIM_PATH} fill={`url(#${rimId})`} />
        <path
          d={RIM_PATH}
          fill='none'
          stroke={tone.clone().darken(26).toString()}
          strokeWidth='2.5'
          strokeLinejoin='round'
          opacity='0.55'
        />
        <path d={FACE_PATH} fill={`url(#${faceId})`} />
        <path d={FACE_PATH} fill={`url(#${glossId})`} />
        <path
          d={INNER_PATH}
          fill='none'
          stroke='#000000'
          strokeOpacity='0.22'
          strokeWidth='2'
          strokeLinejoin='round'
        />
        <path
          d={INNER_PATH}
          fill='none'
          stroke='#ffffff'
          strokeOpacity='0.3'
          strokeWidth='2'
          strokeLinejoin='round'
          transform='translate(0 -2)'
        />

        <g
          fill='none'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          transform={GLYPH_TRANSFORM}
        >
          <g color='#000000' opacity='0.28' transform='translate(0 0.9)'>
            <BadgeGlyphShapes glyph={glyph} />
          </g>
          <g color='#ffffff'>
            <BadgeGlyphShapes glyph={glyph} />
          </g>
        </g>
      </svg>
    </Box>
  );
};
