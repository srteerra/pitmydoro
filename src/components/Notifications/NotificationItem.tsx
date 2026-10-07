'use client';

import React from 'react';
import { Avatar, Box, Circle, HStack, Text, VStack } from '@chakra-ui/react';
import { LuMegaphone } from 'react-icons/lu';
import { useLocale, useTranslations } from 'next-intl';
import { AppNotification } from '@/interfaces/Notification.interface';
import { NotificationTypeEnum } from '@/enums/NotificationType.enum';
import { resolveLocalizedText } from '@/utils/notifications.utils';
import { relativeTime } from '@/utils/relativeTime.utils';
import { timestampUtils } from '@/utils/timestamp.utils';

interface Props {
  notification: AppNotification;
  onSelect: (notification: AppNotification) => void;
}

const ACTOR_MESSAGE_KEYS: Partial<Record<NotificationTypeEnum, string>> = {
  [NotificationTypeEnum.FOLLOW]: 'messages.follow',
  [NotificationTypeEnum.COMMENT]: 'messages.comment',
  [NotificationTypeEnum.REACTION]: 'messages.reaction',
};

const useNotificationText = (notification: AppNotification) => {
  const t = useTranslations('notifications');
  const locale = useLocale();
  const messageKey = ACTOR_MESSAGE_KEYS[notification.type];
  const actorName = notification.actor?.displayName || notification.actor?.username || '';

  return {
    title: messageKey
      ? t(messageKey, { name: actorName })
      : resolveLocalizedText(notification.title, locale) || t('messages.system'),
    body: resolveLocalizedText(notification.body, locale),
    time: relativeTime(locale, timestampUtils.toMillis(notification.createdAt)),
  };
};

const NotificationIcon = ({ notification }: { notification: AppNotification }) => {
  if (!notification.actor) {
    return (
      <Circle size='9' bg='bg.emphasized' color='fg.muted' flexShrink={0}>
        <LuMegaphone />
      </Circle>
    );
  }

  return (
    <Avatar.Root size='sm' borderRadius='full' flexShrink={0}>
      <Avatar.Fallback name={notification.actor.displayName} />
      {notification.actor.photoURL && (
        <Avatar.Image src={notification.actor.photoURL} alt={notification.actor.displayName} />
      )}
    </Avatar.Root>
  );
};

export const NotificationItem = ({ notification, onSelect }: Props) => {
  const { title, body, time } = useNotificationText(notification);

  return (
    <HStack
      as='button'
      data-pw-id={`notification-${notification.id}`}
      onClick={() => onSelect(notification)}
      width='100%'
      textAlign='start'
      align='flex-start'
      gap={3}
      px={3}
      py={2.5}
      rounded='lg'
      cursor='pointer'
      bg={notification.read ? 'transparent' : 'bg.muted'}
      _hover={{ bg: 'bg.emphasized' }}
    >
      <NotificationIcon notification={notification} />

      <VStack align='stretch' gap={0.5} flex={1} minW={0}>
        <Text fontSize='sm' fontWeight={notification.read ? 'normal' : 'semibold'}>
          {title}
        </Text>
        {body && (
          <Text fontSize='xs' color='fg.muted' lineClamp={3}>
            {body}
          </Text>
        )}
        {time && (
          <Text fontSize='xs' color='fg.subtle'>
            {time}
          </Text>
        )}
      </VStack>

      {!notification.read && (
        <Box paddingTop={1.5}>
          <Circle size='8px' bg='red.500' />
        </Box>
      )}
    </HStack>
  );
};
