'use client';

import React from 'react';
import { Box, HStack, Text } from '@chakra-ui/react';
import { LuClock } from 'react-icons/lu';
import moment from 'moment/min/moment-with-locales';
import { timestampUtils } from '@/utils/timestamp.utils';
import { useLocale, useTranslations } from 'use-intl';
import { UserProfile } from '@/interfaces/UserProfile.interface';

interface Props {
  value: UserProfile['lastConnection'];
}

export const LastConnection = ({ value }: Props) => {
  const t = useTranslations('profile');
  const locale = useLocale();
  moment.locale(locale);

  const lastConnectionMs = timestampUtils.toMillis(value ?? 0);
  const lastConnection = lastConnectionMs ? moment(lastConnectionMs).fromNow() : t('never');

  return (
    <HStack
      position='absolute'
      zIndex={1}
      top={6}
      right={6}
      gap={1.5}
      paddingX={3}
      paddingY={1.5}
      borderRadius='full'
      fontSize='sm'
      flexShrink={0}
      bgColor={{ base: 'gray.100/80', _dark: 'gray.800/60' }}
      backdropFilter='blur(6px)'
    >
      <Box color='fg.muted' display='inline-flex'>
        <LuClock size={14} />
      </Box>
      <Text truncate>
        {t('lastConnection')}: {lastConnection}
      </Text>
    </HStack>
  );
};
