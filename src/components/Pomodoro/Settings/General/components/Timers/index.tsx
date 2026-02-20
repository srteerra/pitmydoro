import { Box, Flex, NumberInput, Text, VStack } from '@chakra-ui/react';
import { TireTypeEnum } from '@/enums/TireType.enum';
import { SessionStatusEnum } from '@/enums/SessionStatus.enum';
import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { useTranslations } from 'use-intl';
import useSettingsStore from '@/stores/Settings.store';

export const Timers = () => {
  const { handleChangeBreakDuration, handleChangeTireDuration } = useSettings();
  const tiresSettings = useSettingsStore((state) => state.tiresSettings);
  const breaksDuration = useSettingsStore((state) => state.breaksDuration);
  const t = useTranslations('settings.sections.timers');

  const [localTiresSettings, setLocalTiresSettings] = useState(tiresSettings);
  const [localBreaksDuration, setLocalBreaksDuration] = useState(breaksDuration);

  const tireTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const breakTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const handleTireChange = (tire: TireTypeEnum, value: number) => {
    setLocalTiresSettings((prev) => ({
      ...prev,
      [tire]: { ...prev[tire], duration: value },
    }));

    if (tireTimers.current[tire]) {
      clearTimeout(tireTimers.current[tire]);
    }

    tireTimers.current[tire] = setTimeout(() => {
      handleChangeTireDuration(tire, value);
    }, 1000);
  };

  const handleBreakChange = (status: SessionStatusEnum, value: number) => {
    setLocalBreaksDuration((prev) => ({
      ...prev,
      [status]: value,
    }));

    if (breakTimers.current[status]) {
      clearTimeout(breakTimers.current[status]);
    }

    breakTimers.current[status] = setTimeout(() => {
      handleChangeBreakDuration(status, value);
    }, 1000);
  };

  useEffect(() => {
    setLocalTiresSettings(tiresSettings);
  }, [tiresSettings]);

  useEffect(() => {
    setLocalBreaksDuration(breaksDuration);
  }, [breaksDuration]);

  const tires = [
    TireTypeEnum.SOFT,
    TireTypeEnum.MEDIUM,
    TireTypeEnum.HARD,
    TireTypeEnum.INTERMEDIATE,
    TireTypeEnum.WET,
  ];

  const tiresLabel = {
    [TireTypeEnum.SOFT]: t('soft'),
    [TireTypeEnum.MEDIUM]: t('medium'),
    [TireTypeEnum.HARD]: t('hard'),
    [TireTypeEnum.INTERMEDIATE]: t('intermediate'),
    [TireTypeEnum.WET]: t('wet'),
  };

  const ICON_SIZE = 50;
  const TOTAL_ICONS = 7;
  const backgroundSize = `${ICON_SIZE * TOTAL_ICONS}px auto`;

  return (
    <VStack gap={8} marginY={'20px'}>
      <Flex
        w='full'
        px={10}
        gap={3}
        justifyContent={{ base: 'center', md: 'space-between' }}
        flexWrap={'wrap'}
      >
        {tires.map((tire: TireTypeEnum, idx: number) => (
          <VStack key={idx}>
            <Box
              cursor={'pointer'}
              style={{
                backgroundImage: "url('./images/tires.webp')",
                backgroundSize,
                backgroundPositionX: `-${ICON_SIZE * idx}px`,
                width: `${ICON_SIZE}px`,
                height: `${ICON_SIZE}px`,
              }}
            />
            <Text>{tiresLabel[tire]}</Text>
            <NumberInput.Root
              maxW='70px'
              minW='70px'
              size={'xs'}
              min={1}
              value={String(localTiresSettings[tire].duration)}
              onValueChange={(e) => handleTireChange(tire, Number(e.value))}
            >
              <NumberInput.Control>
                <NumberInput.IncrementTrigger />
                <NumberInput.DecrementTrigger />
              </NumberInput.Control>
              <NumberInput.Input />
            </NumberInput.Root>
          </VStack>
        ))}
      </Flex>

      <Flex w='full' px={10} gap={10} justifyContent='center'>
        <VStack>
          <Box
            cursor={'pointer'}
            style={{
              backgroundImage: "url('./images/tires.webp')",
              backgroundSize,
              backgroundPositionX: `-${ICON_SIZE * 5}px`,
              width: `${ICON_SIZE}px`,
              height: `${ICON_SIZE}px`,
            }}
          />
          <Text>{t('shortBreakDuration.title')}</Text>
          <NumberInput.Root
            maxW='70px'
            minW='70px'
            size={'xs'}
            min={1}
            value={String(localBreaksDuration[SessionStatusEnum.SHORT_BREAK])}
            onValueChange={(e) => handleBreakChange(SessionStatusEnum.SHORT_BREAK, Number(e.value))}
          >
            <NumberInput.Control>
              <NumberInput.IncrementTrigger />
              <NumberInput.DecrementTrigger />
            </NumberInput.Control>
            <NumberInput.Input />
          </NumberInput.Root>
        </VStack>

        <VStack>
          <Box
            cursor={'pointer'}
            style={{
              backgroundImage: "url('./images/tires.webp')",
              backgroundSize,
              backgroundPositionX: `-${ICON_SIZE * 6}px`,
              width: `${ICON_SIZE}px`,
              height: `${ICON_SIZE}px`,
            }}
          />
          <Text>{t('longBreakDuration.title')}</Text>
          <NumberInput.Root
            maxW='70px'
            minW='70px'
            size={'xs'}
            min={1}
            value={String(localBreaksDuration[SessionStatusEnum.LONG_BREAK])}
            onValueChange={(e) => handleBreakChange(SessionStatusEnum.LONG_BREAK, Number(e.value))}
          >
            <NumberInput.Control>
              <NumberInput.IncrementTrigger />
              <NumberInput.DecrementTrigger />
            </NumberInput.Control>
            <NumberInput.Input />
          </NumberInput.Root>
        </VStack>
      </Flex>
    </VStack>
  );
};
