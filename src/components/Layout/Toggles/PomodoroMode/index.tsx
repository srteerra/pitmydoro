'use client';

import { IconButton } from '@chakra-ui/react';
import { RxEyeOpen } from 'react-icons/rx';
import { useEffect, useState } from 'react';
import useSettingsStore from '@/stores/Settings.store';
import { PomodoroMode } from '@/interfaces/Settings.interface';
import { useSettings } from '@/hooks/useSettings';
import { useTimerGuard } from '@/hooks/useTimerGuard';

export function TogglePomodoroMode() {
  const mode = useSettingsStore((state) => state.mode);
  const [mounted, setMounted] = useState(false);
  const { handleToggleMode } = useSettings();
  const { confirmInterruptIfRunning } = useTimerGuard();

  useEffect(() => {
    setMounted(true);
  }, []);

  const togglePomodoroMode = async () => {
    if (!(await confirmInterruptIfRunning())) return;
    await handleToggleMode(mode === PomodoroMode.F1 ? PomodoroMode.MINIMAL : PomodoroMode.F1);
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
