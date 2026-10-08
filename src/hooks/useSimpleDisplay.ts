import { useCallback } from 'react';
import { usePomodoroStore } from '@/stores/Pomodoro.store';

export function useSimpleDisplay() {
  const isSimpleDisplay = usePomodoroStore((state) => state.isSimpleDisplay);
  const setIsSimpleDisplay = usePomodoroStore((state) => state.setIsSimpleDisplay);

  const enterSimpleDisplay = useCallback(() => {
    setIsSimpleDisplay(true);
    document.documentElement.requestFullscreen?.().catch(() => {});
  }, [setIsSimpleDisplay]);

  const exitSimpleDisplay = useCallback(() => {
    setIsSimpleDisplay(false);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }, [setIsSimpleDisplay]);

  return { isSimpleDisplay, enterSimpleDisplay, exitSimpleDisplay };
}
