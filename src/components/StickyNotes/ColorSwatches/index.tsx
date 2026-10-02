'use client';

import { Box, HStack } from '@chakra-ui/react';
import { StickyNoteColor, StickyNotePalette } from '@/interfaces/StickyNote.interface';
import { STICKY_NOTE_COLORS, STICKY_NOTE_PALETTE } from '@/constants/StickyNotes';

interface ColorSwatchesProps {
  value: StickyNoteColor;
  palette: StickyNotePalette;
  palettes?: Record<StickyNoteColor, StickyNotePalette>;
  getAriaLabel: (color: StickyNoteColor) => string;
  onChange: (color: StickyNoteColor) => void;
}

export const ColorSwatches = ({
  value,
  palette,
  palettes = STICKY_NOTE_PALETTE,
  getAriaLabel,
  onChange,
}: ColorSwatchesProps) => (
  <HStack gap={1}>
    {STICKY_NOTE_COLORS.map((color: StickyNoteColor) => (
      <Box
        key={color}
        as='button'
        aria-label={getAriaLabel(color)}
        aria-pressed={color === value}
        onClick={() => onChange(color)}
        width='18px'
        height='18px'
        rounded='full'
        cursor='pointer'
        bg={{
          base: palettes[color].swatch,
          _dark: palettes[color].surfaceDark,
        }}
        borderWidth={color === value ? '2px' : '1px'}
        borderColor={
          color === value
            ? { base: palette.text, _dark: palette.textDark }
            : { base: 'rgba(0, 0, 0, 0.25)', _dark: 'rgba(255, 255, 255, 0.3)' }
        }
      />
    ))}
  </HStack>
);
