import { VStack } from "@chakra-ui/react";
import { SwitchInput } from "@/components/Form/SwitchInput";
import React from "react";
import { useTranslations } from "use-intl";

export const Notifications = () => {
  const t = useTranslations('settings.sections.notifications');

  return (
    <VStack gap={8} marginY={'20px'} width={'100%'}>
      <SwitchInput
        title={t('enableNotifications.title')}
        description={t('enableNotifications.description')}
        value={false}
        defaultValue={false}
        onChange={() => {}}
      />
    </VStack>
  )
}