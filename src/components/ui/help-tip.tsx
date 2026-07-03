import { IconButton, type IconButtonProps } from '@chakra-ui/react';
import * as React from 'react';
import { HiOutlineQuestionMarkCircle } from 'react-icons/hi';
import { Tooltip, type TooltipProps } from '@/components/ui/tooltip';

type Placement = NonNullable<TooltipProps['positioning']>['placement'];

export interface HelpTipProps {
  content: React.ReactNode;
  placement?: Placement;
  openDelay?: number;
  closeDelay?: number;
  label?: string;
  buttonProps?: IconButtonProps;
}

export const HelpTip = ({
  content,
  placement = 'right',
  openDelay = 100,
  closeDelay = 100,
  label = 'info',
  buttonProps,
}: HelpTipProps) => (
  <Tooltip
    content={content}
    showArrow
    openDelay={openDelay}
    closeDelay={closeDelay}
    positioning={{ placement }}
    contentProps={{ maxW: '12rem', textStyle: 'xs' }}
  >
    <IconButton
      aria-label={label}
      variant='ghost'
      size='2xs'
      colorPalette='gray'
      cursor='help'
      opacity={0.5}
      _hover={{ opacity: 1, bg: 'gray.500/15' }}
      {...buttonProps}
    >
      <HiOutlineQuestionMarkCircle />
    </IconButton>
  </Tooltip>
);
