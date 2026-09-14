import { useSyncExternalStore } from 'react';
import { usePomodoroStore } from '@/stores/Pomodoro.store';
import {
  checkSessionLockedByOtherTab,
  isSessionLockedByOtherTab,
  subscribeSessionLock,
} from '@/utils/sessionLock.utils';

const noSessionElsewhere = () => false;

export const isSessionLocked = () =>
  usePomodoroStore.getState().currentPomodoro !== null || checkSessionLockedByOtherTab();

export const useSessionLockedElsewhere = () =>
  useSyncExternalStore(subscribeSessionLock, isSessionLockedByOtherTab, noSessionElsewhere);

export const useSessionLock = () => {
  const ownSession = usePomodoroStore((state) => state.currentPomodoro !== null);
  const sessionElsewhere = useSessionLockedElsewhere();

  return ownSession || sessionElsewhere;
};
