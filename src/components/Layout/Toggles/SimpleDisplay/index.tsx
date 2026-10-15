'use client';

import { IconButton } from '@chakra-ui/react';
import { LuMaximize2 } from 'react-icons/lu';
import { useTranslations } from 'next-intl';
import { useSimpleDisplay } from '@/hooks/useSimpleDisplay';

interface Props {
  onEnter?: () => void;
}

export function ToggleSimpleDisplay({ onEnter }: Props) {
  const t = useTranslations('pomodoro');
  const { enterSimpleDisplay } = useSimpleDisplay();

  const handleClick = () => {
    enterSimpleDisplay();
    onEnter?.();
  };

  return (
    <IconButton
      data-pw-id='simple-display-button'
      aria-label={t('enterSimpleDisplay')}
      onClick={handleClick}
      variant={'ghost'}
      rounded='full'
      outline='none'
      color={{ base: 'gray.500', _hover: 'gray.700' }}
    >
      <LuMaximize2 />
    </IconButton>
  );
}
