import { Box, Flex, NumberInput, Text, VStack } from '@chakra-ui/react';
import { TireTypeEnum } from '@/enums/TireType.enum';
import { SessionStatusEnum } from '@/enums/SessionStatus.enum';
import React, { useCallback, useEffect, useState } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { useTranslations } from 'next-intl';
import useSettingsStore from '@/stores/Settings.store';
import { useDebounce } from '@/hooks/useDebounce';
import { useAlert } from '@/hooks/useAlert';
import { MAX_DURATION } from '@/constants/DefaultSettings';

export const Timers = () => {
  const { handleChangeBreakDuration, handleChangeTireDuration } = useSettings();
  const tiresSettings = useSettingsStore((state) => state.tiresSettings);
  const breaksDuration = useSettingsStore((state) => state.breaksDuration);
  const t = useTranslations('settings.sections.timers');
  const { toastError } = useAlert();

  const [localTiresSettings, setLocalTiresSettings] = useState(tiresSettings);
  const [localBreaksDuration, setLocalBreaksDuration] = useState(breaksDuration);

  const validateDuration = useCallback(
    (value: number): number => {
      if (value > MAX_DURATION) {
        toastError(t('maxDurationExceeded', { max: MAX_DURATION }));
        return MAX_DURATION;
      }
      return Math.max(1, value);
    },
    [toastError, t]
  );

  const debouncedTireDuration = useDebounce(handleChangeTireDuration, 1000);
  const debouncedBreakDuration = useDebounce(handleChangeBreakDuration, 1000);

  const handleTireChange = (tire: TireTypeEnum, value: number) => {
    const validatedValue = validateDuration(value);

    setLocalTiresSettings((prev) => ({
      ...prev,
      [tire]: { ...prev[tire], duration: validatedValue },
    }));

    debouncedTireDuration(tire, validatedValue);
  };

  const handleBreakChange = (status: SessionStatusEnum, value: number) => {
    const validatedValue = validateDuration(value);

    setLocalBreaksDuration((prev) => ({
      ...prev,
      [status]: validatedValue,
    }));

    debouncedBreakDuration(status, validatedValue);
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
        px={{ base: 0, md: 10 }}
        gap={{ base: 4, md: 3 }}
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
              max={MAX_DURATION}
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

      <Flex
        w='full'
        px={{ base: 0, md: 10 }}
        gap={{ base: 8, md: 10 }}
        justifyContent='center'
        flexWrap='wrap'
      >
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
            max={MAX_DURATION}
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
            max={MAX_DURATION}
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
