import { Box, Flex, NumberInput, Text, VStack } from "@chakra-ui/react";
import { TireTypeEnum } from "@/utils/enums/TireType.enum";
import { SessionStatusEnum } from "@/utils/enums/SessionStatus.enum";
import React from "react";
import { useSettings } from "@/hooks/useSettings";
import { useTranslations } from "use-intl";

export const Timers = () => {
  const {
    tiresSettings,
    breaksDuration,
    handleChangeBreakDuration,
    handleChangeTireDuration
  } = useSettings();
  const t = useTranslations('settings.sections.timers');

  const tires = [TireTypeEnum.SOFT, TireTypeEnum.MEDIUM, TireTypeEnum.HARD, TireTypeEnum.INTERMEDIATE, TireTypeEnum.WET];
  const tiresLabel = {
    [TireTypeEnum.SOFT]: t('soft'),
    [TireTypeEnum.MEDIUM]: t('medium'),
    [TireTypeEnum.HARD]: t('hard'),
    [TireTypeEnum.INTERMEDIATE]: t('intermediate'),
    [TireTypeEnum.WET]: t('wet'),
  }
  const ICON_SIZE = 50;

  return (
    <VStack gap={8} marginY={'20px'}>
      <Flex w='full' px={10} gap={3} justifyContent={{ base: 'center', md: 'space-between' }} flexWrap={'wrap'}>
        {tires.map((tire: TireTypeEnum, idx: number) => (
          <VStack key={idx}>
            <Box
              cursor={'pointer'}
              style={{
                backgroundImage: "url('./images/tires.png')",
                backgroundSize: `${ICON_SIZE * tires.length}px auto`,
                backgroundPositionX: `-${ICON_SIZE * idx}px`,
                width: `${ICON_SIZE}px`,
                height: `${ICON_SIZE}px`,
              }}
            />
            <Text>{tiresLabel[tire]}</Text>
            <NumberInput.Root
              maxW="70px"
              minW="70px"
              size={'xs'}
              min={1}
              value={String(tiresSettings[tire].duration)}
              onValueChange={(e) => handleChangeTireDuration(tire, Number(e.value))}
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
              backgroundImage: "url('./images/tires.png')",
              backgroundSize: `${ICON_SIZE * tires.length}px auto`,
              backgroundPositionX: `-${ICON_SIZE * 1}px`,
              width: `${ICON_SIZE}px`,
              height: `${ICON_SIZE}px`,
            }}
          />
          <Text>{t('shortBreakDuration.title')}</Text>
          <NumberInput.Root
            maxW="70px"
            minW="70px"
            size={'xs'}
            min={1}
            value={String(breaksDuration[SessionStatusEnum.SHORT_BREAK])}
            onValueChange={(e) => handleChangeBreakDuration(SessionStatusEnum.SHORT_BREAK, Number(e.value))}
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
              backgroundImage: "url('./images/tires.png')",
              backgroundSize: `${ICON_SIZE * tires.length}px auto`,
              backgroundPositionX: `-${ICON_SIZE * 1}px`,
              width: `${ICON_SIZE}px`,
              height: `${ICON_SIZE}px`,
            }}
          />
          <Text>{t('longBreakDuration.title')}</Text>
          <NumberInput.Root
            maxW="70px"
            minW="70px"
            size={'xs'}
            min={1}
            value={String(breaksDuration[SessionStatusEnum.LONG_BREAK])}
            onValueChange={(e) => handleChangeBreakDuration(SessionStatusEnum.LONG_BREAK, Number(e.value))}
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
  )
}