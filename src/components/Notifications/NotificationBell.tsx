'use client';

import React, { useState } from 'react';
import {
  Badge,
  Button,
  Flex,
  Float,
  IconButton,
  Popover,
  Portal,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import { LuBell } from 'react-icons/lu';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/hooks/useNotifications';
import { AppNotification } from '@/interfaces/Notification.interface';
import { formatUnreadCount, isInternalLink } from '@/utils/notifications.utils';
import { NotificationItem } from '@/components/Notifications/NotificationItem';

const NotificationList = ({
  notifications,
  loading,
  onSelect,
}: {
  notifications: AppNotification[];
  loading: boolean;
  onSelect: (notification: AppNotification) => void;
}) => {
  const t = useTranslations('notifications');

  if (loading) {
    return (
      <Flex justify='center' py={8}>
        <Spinner size='sm' />
      </Flex>
    );
  }

  if (notifications.length === 0) {
    return (
      <Text
        data-pw-id='notifications-empty'
        color='fg.muted'
        fontSize='sm'
        textAlign='center'
        py={8}
      >
        {t('empty')}
      </Text>
    );
  }

  return (
    <VStack align='stretch' gap={1}>
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} onSelect={onSelect} />
      ))}
    </VStack>
  );
};

export const NotificationBell = () => {
  const t = useTranslations('notifications');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications(open);

  const handleSelect = (notification: AppNotification) => {
    void markAsRead(notification);
    if (!notification.link) return;

    setOpen(false);
    if (isInternalLink(notification.link)) {
      router.push(notification.link);
      return;
    }
    window.open(notification.link, '_blank', 'noopener,noreferrer');
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={(details) => setOpen(details.open)}
      positioning={{ placement: 'bottom-end' }}
    >
      <Popover.Trigger asChild>
        <IconButton
          data-pw-id='notifications-trigger'
          aria-label={t('title')}
          variant='ghost'
          rounded='full'
          position='relative'
          color={{ base: 'gray.600', _hover: 'gray.800' }}
        >
          <LuBell />
          {unreadCount > 0 && (
            <Float placement='top-end' offsetX='2' offsetY='2'>
              <Badge
                data-pw-id='notifications-unread-count'
                colorPalette='red'
                variant='solid'
                rounded='full'
                size='xs'
                pointerEvents='none'
              >
                {formatUnreadCount(unreadCount)}
              </Badge>
            </Float>
          )}
        </IconButton>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content data-pw-id='notifications-panel' width={{ base: '90vw', sm: '360px' }}>
            <Popover.Header>
              <Flex justify='space-between' align='center' width='100%'>
                <Text fontWeight='semibold'>{t('title')}</Text>
                <Button
                  data-pw-id='notifications-mark-all'
                  size='xs'
                  variant='ghost'
                  disabled={unreadCount === 0}
                  onClick={() => void markAllAsRead()}
                >
                  {t('markAllRead')}
                </Button>
              </Flex>
            </Popover.Header>
            <Popover.Body maxH='420px' overflowY='auto' px={2} pt={0}>
              <NotificationList
                notifications={notifications}
                loading={loading}
                onSelect={handleSelect}
              />
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};
