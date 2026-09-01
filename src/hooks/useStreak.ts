import { useMemo } from 'react';
import useUserStore from '@/stores/User.store';
import { isStreakActiveToday, localDayKey, resolveStreak } from '@/utils/streak.utils';

export const useStreak = () => {
  const streak = useUserStore((state) => state.profile?.streak);

  return useMemo(() => {
    const today = localDayKey();
    const resolved = resolveStreak(streak, today);

    return {
      current: resolved.current,
      longest: resolved.longest,
      lastDay: resolved.lastDay,
      activeToday: isStreakActiveToday(streak, today),
    };
  }, [streak]);
};
