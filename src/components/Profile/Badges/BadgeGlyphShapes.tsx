import React from 'react';
import { BadgeGlyph } from '@/interfaces/Badge.interface';

export const BadgeGlyphShapes = ({ glyph }: { glyph: BadgeGlyph }) => (
  <>
    {glyph.paths?.map((path) => (
      <path
        key={path.d}
        d={path.d}
        fill={path.fill ? 'currentColor' : 'none'}
        stroke={path.fill ? 'none' : 'currentColor'}
      />
    ))}
    {glyph.circles?.map((circle) => (
      <circle
        key={`${circle.cx}-${circle.cy}`}
        cx={circle.cx}
        cy={circle.cy}
        r={circle.r}
        fill={circle.fill ? 'currentColor' : 'none'}
        stroke={circle.fill ? 'none' : 'currentColor'}
      />
    ))}
  </>
);
