'use client';

import { FocusEvent, ReactNode, useState } from 'react';
import { Box, BoxProps, Text, VStack } from '@chakra-ui/react';
import { StickyNoteColor, StickyNotePalette } from '@/interfaces/StickyNote.interface';
import { PinButton } from '@/components/PinButton';
import { TAB_SLIDE_IN_ANIMATION } from '@/constants/Animations';
import {
  DEFAULT_TAB_COLORS,
  DIMMED_TAB_OPACITY,
  DIMMED_TAB_TRANSITION,
} from '@/constants/TabColors';
import {
  PROJECT_PALETTE,
  PROJECT_TAB_HEIGHT,
  PROJECT_TAB_PEEK,
  PROJECT_TAB_REVEAL,
  PROJECT_TAB_WIDTH,
} from '@/constants/Projects';

const PULL_TRANSITION = 'transform 0.4s cubic-bezier(0.22, 1.16, 0.4, 1)';
const TUCK_TRANSITION = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
const VERTICAL_TEXT = { writingMode: 'vertical-rl', transform: 'rotate(180deg)' } as const;

export interface ProjectTabProps extends Omit<BoxProps, 'color' | 'height' | 'children'> {
  label?: string;
  ariaLabel?: string;
  color?: StickyNoteColor;
  palette?: StickyNotePalette;
  height?: number;
  icon?: ReactNode;
  active?: boolean;
  dimmed?: boolean;
  pullOnHover?: boolean;
  testId?: string;
  pinned?: boolean;
  pinLabel?: string;
  onTogglePin?: () => void;
  entryDelay?: number;
}

export const ProjectTab = ({
  label,
  ariaLabel,
  color,
  palette: paletteOverride,
  height = PROJECT_TAB_HEIGHT,
  icon,
  active = false,
  dimmed = false,
  pullOnHover = true,
  testId = 'project-tab',
  entryDelay = 0,
  pinned = false,
  pinLabel,
  onTogglePin,
  ...rest
}: ProjectTabProps) => {
  const [hovered, setHovered] = useState(false);
  const palette = paletteOverride ?? (color ? PROJECT_PALETTE[color] : DEFAULT_TAB_COLORS.projects);
  const pulled = pullOnHover && (hovered || active);
  const showPin = hovered || pinned;

  return (
    <Box
      className='group'
      width={`${PROJECT_TAB_WIDTH}px`}
      height={`${height}px`}
      borderLeftRadius='md'
      borderRightRadius='none'
      transform={`translateX(-${pulled ? PROJECT_TAB_REVEAL : PROJECT_TAB_PEEK}px)`}
      transition={`${pulled ? PULL_TRANSITION : TUCK_TRANSITION}, box-shadow 0.25s ease, ${DIMMED_TAB_TRANSITION}`}
      opacity={dimmed && !hovered ? DIMMED_TAB_OPACITY : 1}
      willChange='transform'
      bg={{ base: palette.surface, _dark: palette.surfaceDark }}
      color={{ base: palette.text, _dark: palette.textDark }}
      boxShadow='inset -11px 0 11px -16px rgba(0, 0, 0, 0.45), -3px 5px 22px rgba(0, 0, 0, 0.11)'
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
      <VStack width={`${PROJECT_TAB_PEEK}px`} height='100%' gap={1} paddingY={2} paddingBottom={4}>
        {onTogglePin && showPin && (
          <PinButton
            pinned={pinned}
            label={pinLabel ?? ''}
            onToggle={onTogglePin}
            testId={`${testId}-pin`}
          />
        )}

        <Box
          as='button'
          {...rest}
          data-pw-id={testId}
          aria-label={ariaLabel ?? label}
          aria-expanded={active}
          display='flex'
          alignItems={label ? 'flex-end' : 'center'}
          justifyContent='center'
          flex='1'
          width='100%'
          minHeight={0}
          overflow='hidden'
          cursor='pointer'
          rounded='sm'
          _focusVisible={{
            outline: '2px solid',
            outlineColor: { base: palette.accent, _dark: palette.accentDark },
            outlineOffset: '-2px',
          }}
        >
          {label ? (
            <Text
              fontSize='sm'
              fontWeight='semibold'
              whiteSpace='nowrap'
              maxHeight='100%'
              truncate
              css={VERTICAL_TEXT}
            >
              {label}
            </Text>
          ) : (
            icon
          )}
        </Box>
      </VStack>
    </Box>
  );
};
