'use client';

import { IconButton } from '@chakra-ui/react';
import { RxEyeOpen } from 'react-icons/rx';
import { useEffect, useState } from 'react';
import useSettingsStore from '@/stores/Settings.store';
import { PomodoroMode } from '@/interfaces/Settings.interface';

export function TogglePomodoroMode() {
  const mode = useSettingsStore((state) => state.mode);
  const setPomodoroMode = useSettingsStore((state) => state.setPomodoroMode);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const togglePomodoroMode = () => {
    setPomodoroMode(mode === PomodoroMode.F1 ? PomodoroMode.MINIMAL : PomodoroMode.F1);
  };

  if (!mounted) return null;

  return (
    <IconButton
      data-pw-id={'pomodoro-mode-switcher'}
      variant={'ghost'}
      rounded='full'
      color={{ base: 'gray.500', _hover: 'gray.700' }}
      onClick={togglePomodoroMode}
    >
      <RxEyeOpen />
    </IconButton>
  );
}
