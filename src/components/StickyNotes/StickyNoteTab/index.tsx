'use client';

import { FocusEvent, ReactNode, useState } from 'react';
import { Box, BoxProps, HStack, Text } from '@chakra-ui/react';
import { StickyNoteColor, StickyNotePalette } from '@/interfaces/StickyNote.interface';
import { PinButton } from '@/components/PinButton';
import { TAB_SLIDE_IN_ANIMATION } from '@/constants/Animations';
import { DIMMED_TAB_OPACITY, DIMMED_TAB_TRANSITION } from '@/constants/TabColors';
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
  palette?: StickyNotePalette;
  height?: number;
  width?: number;
  peek?: number;
  reveal?: number;
  icon?: ReactNode;
  active?: boolean;
  dimmed?: boolean;
  pullOnHover?: boolean;
  testId?: string;
  pinned?: boolean;
  pinLabel?: string;
  onTogglePin?: () => void;
  entryDelay?: number;
  indicator?: ReactNode;
}

export const StickyNoteTab = ({
  label,
  ariaLabel,
  color = 'yellow',
  palette: paletteOverride,
  height = STICKY_NOTE_TAB_HEIGHT,
  width = STICKY_NOTE_TAB_WIDTH,
  peek = STICKY_NOTE_TAB_PEEK,
  reveal = STICKY_NOTE_TAB_REVEAL,
  icon,
  active = false,
  dimmed = false,
  pullOnHover = true,
  testId = 'sticky-note-tab',
  entryDelay = 0,
  pinned = false,
  pinLabel,
  onTogglePin,
  indicator,
  ...rest
}: StickyNoteTabProps) => {
  const [hovered, setHovered] = useState(false);
  const palette = paletteOverride ?? STICKY_NOTE_PALETTE[color];
  const pulled = pullOnHover && (hovered || active);
  const showPin = !!onTogglePin && (hovered || pinned);

  return (
    <Box
      className='group'
      position='relative'
      display='flex'
      alignItems='center'
      width={`${width}px`}
      height={`${height}px`}
      paddingRight={showPin ? '10px' : '0'}
      borderLeftRadius='none'
      borderRightRadius='md'
      transform={`translateX(${pulled ? reveal : peek}px)`}
      transition={`${pulled ? PULL_TRANSITION : TUCK_TRANSITION}, box-shadow 0.25s ease, ${DIMMED_TAB_TRANSITION}`}
      opacity={dimmed && !hovered ? DIMMED_TAB_OPACITY : 1}
      willChange='transform'
      bg={{ base: palette.surface, _dark: palette.surfaceDark }}
      color={{ base: palette.text, _dark: palette.textDark }}
      boxShadow='inset 11px 0 11px -16px rgba(0, 0, 0, 0.45), 3px 5px 22px rgba(0, 0, 0, 0.11)'
      animation={TAB_SLIDE_IN_ANIMATION}
      animationDelay={`${entryDelay}ms`}
      _motionReduce={{ transition: 'none', animation: 'none' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={(event: FocusEvent<HTMLDivElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setHovered(false);
      }}
    >
      <Box
        as='button'
        {...rest}
        data-pw-id={testId}
        aria-label={ariaLabel ?? label}
        aria-expanded={active}
        display='flex'
        alignItems='center'
        justifyContent='flex-end'
        flex='1'
        height='100%'
        minWidth={0}
        paddingRight={showPin ? '6px' : '16px'}
        paddingLeft='12px'
        cursor='pointer'
        borderRightRadius='md'
        _focusVisible={{
          outline: '2px solid',
          outlineColor: { base: palette.accent, _dark: palette.accentDark },
          outlineOffset: '2px',
        }}
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

      {onTogglePin && showPin && (
        <PinButton
          pinned={pinned}
          label={pinLabel ?? ''}
          onToggle={onTogglePin}
          testId={`${testId}-pin`}
        />
      )}

      {indicator}
    </Box>
  );
};
