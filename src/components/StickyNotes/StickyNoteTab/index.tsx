'use client';

import { FocusEvent, MouseEvent, ReactNode, useState } from 'react';
import { Box, BoxProps, HStack, Text } from '@chakra-ui/react';
import { StickyNoteColor } from '@/interfaces/StickyNote.interface';
import {
  STICKY_NOTE_PALETTE,
  STICKY_NOTE_TAB_HEIGHT,
  STICKY_NOTE_TAB_PEEK,
  STICKY_NOTE_TAB_REVEAL,
  STICKY_NOTE_TAB_WIDTH,
} from '@/constants/StickyNotes';

const PULL_TRANSITION = 'transform 0.4s cubic-bezier(0.22, 1.16, 0.4, 1)';
const TUCK_TRANSITION = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

export interface StickyNoteTabProps extends Omit<
  BoxProps,
  'color' | 'height' | 'width' | 'children'
> {
  label?: string;
  ariaLabel?: string;
  color?: StickyNoteColor;
  height?: number;
  width?: number;
  peek?: number;
  reveal?: number;
  icon?: ReactNode;
  active?: boolean;
  pullOnHover?: boolean;
  testId?: string;
}

export const StickyNoteTab = ({
  label,
  ariaLabel,
  color = 'yellow',
  height = STICKY_NOTE_TAB_HEIGHT,
  width = STICKY_NOTE_TAB_WIDTH,
  peek = STICKY_NOTE_TAB_PEEK,
  reveal = STICKY_NOTE_TAB_REVEAL,
  icon,
  active = false,
  pullOnHover = true,
  testId = 'sticky-note-tab',
  ...rest
}: StickyNoteTabProps) => {
  const [hovered, setHovered] = useState(false);
  const palette = STICKY_NOTE_PALETTE[color];
  const pulled = pullOnHover && (hovered || active);

  return (
    <Box
      as='button'
      {...rest}
      data-pw-id={testId}
      aria-label={ariaLabel ?? label}
      aria-expanded={active}
      onMouseEnter={(event: MouseEvent<HTMLDivElement>) => {
        setHovered(true);
        rest.onMouseEnter?.(event);
      }}
      onMouseLeave={(event: MouseEvent<HTMLDivElement>) => {
        setHovered(false);
        rest.onMouseLeave?.(event);
      }}
      onFocus={(event: FocusEvent<HTMLDivElement>) => {
        setHovered(true);
        rest.onFocus?.(event);
      }}
      onBlur={(event: FocusEvent<HTMLDivElement>) => {
        setHovered(false);
        rest.onBlur?.(event);
      }}
      display='flex'
      alignItems='center'
      justifyContent='flex-end'
      width={`${width}px`}
      height={`${height}px`}
      paddingRight='16px'
      paddingLeft='12px'
      cursor='pointer'
      borderLeftRadius='none'
      borderRightRadius='md'
      transform={`translateX(${pulled ? reveal : peek}px)`}
      transition={`${pulled ? PULL_TRANSITION : TUCK_TRANSITION}, box-shadow 0.25s ease`}
      willChange='transform'
      bg={{ base: palette.surface, _dark: palette.surfaceDark }}
      color={{ base: palette.text, _dark: palette.textDark }}
      boxShadow='inset 11px 0 11px -16px rgba(0, 0, 0, 0.45), 3px 5px 22px rgba(0, 0, 0, 0.11)'
      _focusVisible={{
        outline: '2px solid',
        outlineColor: { base: palette.accent, _dark: palette.accentDark },
        outlineOffset: '2px',
      }}
      _motionReduce={{ transition: 'none' }}
    >
      <HStack gap={2} minWidth={0}>
        {label && (
          <Text fontSize='sm' fontWeight='semibold' whiteSpace='nowrap' truncate>
            {label}
          </Text>
        )}
        {icon}
      </HStack>
    </Box>
  );
};
