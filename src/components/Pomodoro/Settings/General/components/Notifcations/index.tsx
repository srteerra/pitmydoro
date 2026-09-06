import { Box, Flex, HStack, IconButton, NumberInput, Text, VStack } from '@chakra-ui/react';
import { SwitchInput } from '@/components/Form/SwitchInput';
import React from 'react';
import { useTranslations } from 'next-intl';
import { useSettings } from '@/hooks/useSettings';
import useSettingsStore from '@/stores/Settings.store';
import { LuMinus, LuPlus } from 'react-icons/lu';

export const Notifications = () => {
  const { handleSwitchNotifications, handleEarlyAlertSeconds } = useSettings();
  const enableNotifications = useSettingsStore((state) => state.enableNotifications);
  const earlyAlertSeconds = useSettingsStore((state) => state.earlyAlertSeconds);
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
      <Flex w='full' justifyContent='space-between' alignItems='center' gap={4}>
        <Box>
          <Text fontWeight={'medium'}>{t('earlyAlert.title')}</Text>
          <Text fontWeight={'light'} color={'gray.400'} fontSize={'xs'}>
            {t('earlyAlert.description')}
          </Text>
        </Box>
        <NumberInput.Root
          aria-label={t('earlyAlert.title')}
          size={'xs'}
          value={String(earlyAlertSeconds)}
          onValueChange={(event) => handleEarlyAlertSeconds(Number(event.value))}
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
