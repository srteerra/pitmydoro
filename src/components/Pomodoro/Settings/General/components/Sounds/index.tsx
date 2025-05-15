import { VStack } from "@chakra-ui/react";
import React from "react";
import { SwitchInput } from "@/components/Form/SwitchInput";
import { useTranslations } from "use-intl";
import { useSettings } from "@/hooks/useSettings";

export const Sounds = () => {
  const {
    enableSounds,
    handleSwitchSounds
  } = useSettings();
  const t = useTranslations('settings.sections.sounds');

  return (
    <VStack gap={8} marginY={'20px'} width={'100%'}>
      <SwitchInput
        title={t('enableSound.title')}
        description={t('enableSound.description')}
        value={enableSounds}
        defaultValue={false}
        onChange={(value: boolean) => handleSwitchSounds(value)}
      />
    </VStack>
  )
}