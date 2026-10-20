import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { useAlert } from '@/hooks/useAlert';
import { followService } from '@/services/follow.service';
import useUserStore from '@/stores/User.store';
import { Follow } from '@/interfaces/Follow.interface';
import { MAX_FAVORITES } from '@/constants/Social';

const shiftOwnFollowingCount = (delta: number) => {
  const { profile, updateProfile } = useUserStore.getState();
  if (!profile) return;
  updateProfile({ followingCount: Math.max(0, (profile.followingCount ?? 0) + delta) });
};

export function useFollow(targetUid: string | undefined, initialFollowersCount = 0) {
  const { user } = useAuth();
  const t = useTranslations('social');
  const { toastWarning, toastError } = useAlert();
  const [follow, setFollow] = useState<Follow | null>(null);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);

  const viewerId = user?.uid;
  const followeeId = viewerId && targetUid && viewerId !== targetUid ? targetUid : null;

  useEffect(() => setFollowersCount(initialFollowersCount), [initialFollowersCount]);

  useEffect(() => {
    if (!viewerId || !followeeId) {
      setFollow(null);
      return;
    }

    let active = true;
    setLoading(true);

    followService
      .getFollow(viewerId, followeeId)
      .then((result) => active && setFollow(result))
      .catch(() => active && setFollow(null))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [viewerId, followeeId]);

  const runPending = useCallback(
    async (action: () => Promise<void>) => {
      setPending(true);
      try {
        await action();
      } catch {
        toastError(t('actionError'));
      } finally {
        setPending(false);
      }
    },
    [t, toastError]
  );

  const toggleFollow = useCallback(async () => {
    if (!viewerId) {
      toastWarning(t('signInToFollow'));
      return;
    }
    if (!followeeId) return;

    await runPending(async () => {
      if (follow) {
        await followService.unfollow(viewerId, followeeId);
        setFollow(null);
        setFollowersCount((count) => Math.max(0, count - 1));
        shiftOwnFollowingCount(-1);
        return;
      }

      await followService.follow(viewerId, followeeId);
      setFollow({ uid: followeeId, favorite: false } as Follow);
      setFollowersCount((count) => count + 1);
      shiftOwnFollowingCount(1);
    });
  }, [viewerId, followeeId, follow, runPending, t, toastWarning]);

  const toggleFavorite = useCallback(async () => {
    if (!viewerId || !followeeId || !follow) return;

    await runPending(async () => {
      const nextFavorite = !follow.favorite;

      if (nextFavorite && (await followService.countFavorites(viewerId)) >= MAX_FAVORITES) {
        toastWarning(t('favoritesLimit', { max: MAX_FAVORITES }));
        return;
      }

      await followService.setFavorite(viewerId, followeeId, nextFavorite);
      setFollow({ ...follow, favorite: nextFavorite });
    });
  }, [viewerId, followeeId, follow, runPending, t, toastWarning]);

  return {
    isFollowing: !!follow,
    isFavorite: !!follow?.favorite,
    followersCount,
    loading,
    pending,
    toggleFollow,
    toggleFavorite,
  };
}
