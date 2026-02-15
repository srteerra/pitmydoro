import { SwitchInput } from '@/components/Form/SwitchInput';
import { Box, Flex, HStack, IconButton, NumberInput, Text, VStack } from '@chakra-ui/react';
import { LuMinus, LuPlus } from 'react-icons/lu';
import React, { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { useTranslations } from 'use-intl';
import useSettingsStore from '@/stores/Settings.store';
import { useDebounce } from '@/hooks/useDebounce';

export const Session = () => {
  const { handleBreaksInterval, handleSwitchBreak, handleSwitchSession } = useSettings();
  const autoStartBreak = useSettingsStore((state) => state.autoStartBreak);
  const autoStartSession = useSettingsStore((state) => state.autoStartSession);
  const breaksInterval = useSettingsStore((state) => state.breaksInterval);
  const t = useTranslations('settings.sections.session');

  const [localBreaksInterval, setLocalBreaksInterval] = useState(breaksInterval);

  useEffect(() => {
    setLocalBreaksInterval(breaksInterval);
  }, [breaksInterval]);

  const debouncedBreaksInterval = useDebounce(handleBreaksInterval, 1000);

  const handleBreaksIntervalChange = (value: number) => {
    if (value < 1) return;
    setLocalBreaksInterval(value);
    debouncedBreaksInterval(value);
  };

  return (
    <VStack gap={8} marginY={'20px'}>
      <SwitchInput
        title={t('autoSwitchSession.title')}
        description={t('autoSwitchSession.description')}
        value={autoStartSession}
        defaultValue={autoStartSession}
        onChange={handleSwitchSession}
      />

      <SwitchInput
        title={t('autoSwitchBreak.title')}
        description={t('autoSwitchBreak.description')}
        value={autoStartBreak}
        defaultValue={autoStartBreak}
        onChange={handleSwitchBreak}
      />

      <Flex w='full' justifyContent='space-between'>
        <Box>
          <Text fontWeight={'medium'} textTransform={'capitalize'}>
            {t('longBreakInterval.title')}
          </Text>
          <Text fontWeight={'light'} color={'gray.400'} fontSize={'xs'}>
            {t('longBreakInterval.description')}
          </Text>
        </Box>

        <NumberInput.Root
          size={'xs'}
          value={String(localBreaksInterval)}
          onValueChange={(e) => handleBreaksIntervalChange(Number(e.value))}
          unstyled
          spinOnPress={false}
          min={1}
        >
          <HStack gap='2'>
            <NumberInput.DecrementTrigger asChild>
              <IconButton variant='outline' size='xs'>
                <LuMinus />
              </IconButton>
            </NumberInput.DecrementTrigger>
            <NumberInput.ValueText textAlign='center' fontSize='md' minW='3ch' />
            <NumberInput.IncrementTrigger asChild>
              <IconButton variant='outline' size='xs'>
                <LuPlus />
              </IconButton>
            </NumberInput.IncrementTrigger>
          </HStack>
        </NumberInput.Root>
      </Flex>
    </VStack>
  );
};
