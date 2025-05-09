import { SwitchInput } from "@/components/Form/SwitchInput";
import { Box, Flex, HStack, IconButton, NumberInput, Text, VStack } from "@chakra-ui/react";
import { LuMinus, LuPlus } from "react-icons/lu";
import React from "react";
import { useSettings } from "@/hooks/useSettings";
import { useTranslations } from "use-intl";

export const Session = () => {
  const {
    autoStartSession,
    autoStartBreak,
    breaksInterval,
    handleBreaksInterval,
    handleSwitchBreak,
    handleSwitchSession,
  } = useSettings();
  const t = useTranslations('settings.sections.session');

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
          defaultValue={String(breaksInterval)}
          value={String(breaksInterval)}
          onValueChange={(e) => handleBreaksInterval(Number(e.value))}
          unstyled
          spinOnPress={false}
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
  )
}