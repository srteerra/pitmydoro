import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService } from '@/services/notification.service';
import { AppNotification } from '@/interfaces/Notification.interface';

export function useNotifications(listening: boolean) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    return notificationService.subscribeUnreadCount(user.uid, setUnreadCount);
  }, [user]);

  useEffect(() => {
    if (!user || !listening) return;

    setLoading(true);
    return notificationService.subscribeRecent(user.uid, (items) => {
      setNotifications(items);
      setLoading(false);
    });
  }, [user, listening]);

  const markAsRead = useCallback(
    async (notification: AppNotification) => {
      if (!user || notification.read) return;
      await notificationService.markAsRead(user.uid, notification.id);
    },
    [user]
  );

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    await notificationService.markAllAsRead(user.uid);
  }, [user]);

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead };
}
