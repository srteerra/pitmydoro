import { Box, Flex, HStack, IconButton, NumberInput, Text, VStack } from '@chakra-ui/react';
import { SwitchInput } from '@/components/Form/SwitchInput';
import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useDebounce } from '@/hooks/useDebounce';
import { useSettings } from '@/hooks/useSettings';
import useSettingsStore from '@/stores/Settings.store';
import { LuMinus, LuPlus } from 'react-icons/lu';

const EARLY_ALERT_COMMIT_DELAY_MS = 800;

export const Notifications = () => {
  const { handleSwitchNotifications, handleEarlyAlertSeconds } = useSettings();
  const enableNotifications = useSettingsStore((state) => state.enableNotifications);
  const earlyAlertSeconds = useSettingsStore((state) => state.earlyAlertSeconds);
  const t = useTranslations('settings.sections.notifications');
  const [earlyAlertDraft, setEarlyAlertDraft] = useState(earlyAlertSeconds);
  const [isSavingEarlyAlert, setIsSavingEarlyAlert] = useState(false);

  // Save once the user stops changing the value, instead of on every step.
  const commitEarlyAlert = useDebounce(async (seconds: number) => {
    try {
      await handleEarlyAlertSeconds(seconds);
    } finally {
      setIsSavingEarlyAlert(false);
    }
  }, EARLY_ALERT_COMMIT_DELAY_MS);

  useEffect(() => setEarlyAlertDraft(earlyAlertSeconds), [earlyAlertSeconds]);

  const handleEarlyAlertChange = (seconds: number) => {
    setEarlyAlertDraft(seconds);
    setIsSavingEarlyAlert(true);
    commitEarlyAlert(seconds);
  };

  return (
    <VStack gap={8} marginY={'20px'} width={'100%'}>
      <SwitchInput
        title={t('enableNotifications.title')}
        description={t('enableNotifications.description')}
        value={enableNotifications}
        defaultValue={false}
        onChange={(value: boolean) => handleSwitchNotifications(value)}
      />
      <Flex w='full' justifyContent='space-between' alignItems='center' gap={4}>
        <Box>
          <Text fontWeight={'medium'}>{t('earlyAlert.title')}</Text>
          <Text fontWeight={'light'} color={'gray.400'} fontSize={'xs'}>
            {t('earlyAlert.description')}
          </Text>
          {isSavingEarlyAlert && (
            <Text
              data-pw-id='early-alert-saving'
              aria-live='polite'
              fontWeight={'light'}
              color={'gray.400'}
              fontSize={'xs'}
            >
              {t('earlyAlert.saving')}
            </Text>
          )}
        </Box>
        <NumberInput.Root
          aria-label={t('earlyAlert.title')}
          size={'xs'}
          value={String(earlyAlertDraft)}
          onValueChange={(event) => handleEarlyAlertChange(Number(event.value))}
          unstyled
          spinOnPress={false}
          min={1}
          max={60}
        >
          <HStack gap='2'>
            <NumberInput.DecrementTrigger asChild>
              <IconButton variant='outline' size='xs' aria-label={t('earlyAlert.decrease')}>
                <LuMinus />
              </IconButton>
            </NumberInput.DecrementTrigger>
            <NumberInput.ValueText textAlign='center' fontSize='md' minW='3ch' />
            <NumberInput.IncrementTrigger asChild>
              <IconButton variant='outline' size='xs' aria-label={t('earlyAlert.increase')}>
                <LuPlus />
              </IconButton>
            </NumberInput.IncrementTrigger>
          </HStack>
        </NumberInput.Root>
      </Flex>
    </VStack>
  );
};
