import { MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { usePomodoro } from '@/hooks/usePomodoro';
import { usePomodoroStore } from '@/stores/Pomodoro.store';

export const useTimerGuard = () => {
  const router = useRouter();
  const isActive = usePomodoroStore((state) => state.isActive);
  const currentPomodoro = usePomodoroStore((state) => state.currentPomodoro);
  const { confirmInterruptIfActive, confirmInterruptIfRunning } = usePomodoro();

  const guardLink = async (event: MouseEvent, href: string) => {
    if (!isActive && !currentPomodoro) return;

    event.preventDefault();
    if (await confirmInterruptIfRunning()) router.push(href);
  };

  return { guardLink, confirmInterruptIfActive, confirmInterruptIfRunning };
};
