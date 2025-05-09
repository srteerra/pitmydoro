import { VStack } from "@chakra-ui/react";
import React from "react";
import { SwitchInput } from "@/components/Form/SwitchInput";
import { SelectInput } from "@/components/Form/SelectInput";
import { useTranslations } from "use-intl";

export const Sounds = () => {
  const t = useTranslations('settings.sections.sounds');

  return (
    <VStack gap={8} marginY={'20px'} width={'100%'}>
      <SwitchInput
        title={t('enableSound.title')}
        description={t('enableSound.description')}
        value={false}
        defaultValue={false}
        onChange={() => {}}
      />

      <SelectInput
        label={t('selectSound.label')}
        portalDisabled
        placeholder={t('selectSound.placeholder')}
        collection={[
          { label: "Sound 1", value: "sound1" },
          { label: "Sound 2", value: "sound2" },
          { label: "Sound 3", value: "sound3" },
        ]}
        value={["sound1"]}
        onChange={() => {}}
        defaultValue={["sound1"]}
      />
    </VStack>
  )
}