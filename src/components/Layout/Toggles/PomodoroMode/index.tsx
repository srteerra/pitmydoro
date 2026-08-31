'use client';

import { IconButton, Menu, Text, VStack } from '@chakra-ui/react';
import { Portal } from '@zag-js/react';
import { BsDiamond } from 'react-icons/bs';
import { useEffect, useState } from 'react';
import useSettingsStore from '@/stores/Settings.store';
import { PomodoroMode } from '@/interfaces/Settings.interface';
import { useSettings } from '@/hooks/useSettings';
import { useTimerGuard } from '@/hooks/useTimerGuard';
import { usePomodoroStore } from '@/stores/Pomodoro.store';
import { useTranslations } from 'next-intl';
import { SCUDERIAS } from '@/constants/Scuderias';
import _ from 'lodash';
import { ModeCard } from './ModeCard';

interface Props {
  portalDisabled?: boolean;
}

const randomCarURL = () => _.sample(SCUDERIAS)?.carURL;

export function TogglePomodoroMode({ portalDisabled = false }: Props) {
  const mode = useSettingsStore((state) => state.mode);
  const currentPomodoro = usePomodoroStore((state) => state.currentPomodoro);
  const [mounted, setMounted] = useState(false);
  const [carURL, setCarURL] = useState(randomCarURL);
  const { handleToggleMode } = useSettings();
  const { confirmInterruptIfRunning } = useTimerGuard();
  const t = useTranslations('header.modeMenu');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenChange = ({ open }: { open: boolean }) => {
    if (open) setCarURL(randomCarURL());
  };

  const selectMode = (next: PomodoroMode) => {
    if (next === mode) return;

    if (!currentPomodoro) {
      void handleToggleMode(next);
      return;
    }

    void confirmInterruptIfRunning().then((confirmed) => {
      if (confirmed) void handleToggleMode(next);
    });
  };

  if (!mounted) return null;

  return (
    <Menu.Root onOpenChange={handleOpenChange}>
      <Menu.Trigger asChild>
        <IconButton
          data-pw-id={'pomodoro-mode-switcher'}
          variant={'ghost'}
          rounded='full'
          outline='none'
          color={{ base: 'gray.500', _hover: 'gray.700' }}
        >
          <BsDiamond />
        </IconButton>
      </Menu.Trigger>

      <Portal disabled={portalDisabled}>
        <Menu.Positioner>
          <Menu.Content
            data-pw-id={'pomodoro-mode-content'}
            padding={3}
            width='306px'
            minWidth='unset'
            borderRadius='2xl'
            _open={{ animationDuration: 'fastest' }}
            _closed={{ animation: 'none' }}
          >
            <Text
              fontSize='2xs'
              fontWeight='medium'
              textTransform='uppercase'
              color='fg.muted/60'
              paddingX={1}
              paddingBottom={2}
            >
              {t('title')}
            </Text>

            <VStack gap={2} align='stretch'>
              <ModeCard
                value={PomodoroMode.MINIMAL}
                label={t('minimal')}
                description={t('minimalDescription')}
                theme='minimal'
                active={mode === PomodoroMode.MINIMAL}
                onSelect={() => selectMode(PomodoroMode.MINIMAL)}
              />
              <ModeCard
                value={PomodoroMode.F1}
                label={t('f1')}
                description={t('f1Description')}
                theme='racing'
                carURL={carURL}
                active={mode === PomodoroMode.F1}
                onSelect={() => selectMode(PomodoroMode.F1)}
              />
            </VStack>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
