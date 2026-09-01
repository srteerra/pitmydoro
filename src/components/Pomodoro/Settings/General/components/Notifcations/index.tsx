import { VStack } from '@chakra-ui/react';
import { SwitchInput } from '@/components/Form/SwitchInput';
import React from 'react';
import { useTranslations } from 'next-intl';
import { useSettings } from '@/hooks/useSettings';
import useSettingsStore from '@/stores/Settings.store';

export const Notifications = () => {
  const { handleSwitchNotifications } = useSettings();
  const enableNotifications = useSettingsStore((state) => state.enableNotifications);
  const t = useTranslations('settings.sections.notifications');

  return (
    <VStack gap={8} marginY={'20px'} width={'100%'}>
      <SwitchInput
        title={t('enableNotifications.title')}
        description={t('enableNotifications.description')}
        value={enableNotifications}
        defaultValue={false}
        onChange={(value: boolean) => handleSwitchNotifications(value)}
      />
    </VStack>
  );
};
