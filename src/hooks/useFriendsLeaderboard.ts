import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { followService } from '@/services/follow.service';
import { friendsLeaderboardService, FriendStanding } from '@/services/friendsLeaderboard.service';
import { monthRange, weekRange } from '@/utils/leaderboardPeriods.utils';

export function useFriendsLeaderboard(enabled: boolean) {
  const { user } = useAuth();
  const [standings, setStandings] = useState<FriendStanding[]>([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!enabled || !user) return;

    let active = true;
    setLoading(true);
    setFailed(false);

    (async () => {
      try {
        const favoriteIds = await followService.getFavoriteIds(user.uid);
        const result = await friendsLeaderboardService.getStandings(
          [user.uid, ...favoriteIds],
          [weekRange(), monthRange()]
        );
        if (!active) return;
        setFavoritesCount(favoriteIds.length);
        setStandings(result);
      } catch {
        if (active) setFailed(true);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [enabled, user]);

  return { standings, favoritesCount, loading, failed };
}
