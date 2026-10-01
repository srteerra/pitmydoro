'use client';

import { MouseEvent } from 'react';
import { IconButton, IconButtonProps } from '@chakra-ui/react';
import { LuPin } from 'react-icons/lu';

interface PinButtonProps extends Omit<IconButtonProps, 'onClick' | 'aria-label' | 'children'> {
  pinned: boolean;
  label: string;
  onToggle: () => void;
  testId?: string;
}

export const PinButton = ({ pinned, label, onToggle, testId, ...rest }: PinButtonProps) => (
  <IconButton
    data-pw-id={testId}
    aria-label={label}
    aria-pressed={pinned}
    variant='ghost'
    size='2xs'
    rounded='full'
    color='inherit'
    flexShrink={0}
    opacity={pinned ? 1 : 0}
    transition='opacity 0.2s ease'
    _groupHover={{ opacity: 1 }}
    _focusVisible={{ opacity: 1 }}
    _hover={{ bg: 'blackAlpha.100', _dark: { bg: 'whiteAlpha.200' } }}
    css={{ '@media (hover: none)': { opacity: 1 } }}
    {...rest}
    onClick={(event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onToggle();
    }}
  >
    <LuPin fill={pinned ? 'currentColor' : 'none'} />
  </IconButton>
);
