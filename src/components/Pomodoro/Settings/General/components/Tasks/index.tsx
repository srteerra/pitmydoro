import { SwitchInput } from "@/components/Form/SwitchInput";
import { VStack } from "@chakra-ui/react";
import React from "react";
import { useSettings } from "@/hooks/useSettings";
import { useTranslations } from "use-intl";

export const Tasks = () => {
  const {
    autoCompleteTask,
    autoStartNextTask,
    autoOrderTasks,
    handleSwitchNextTask,
    handleSwitchOrderTasks,
    handleSwitchAutoCompleteTask,
  } = useSettings();
  const t = useTranslations('settings.sections.tasks');

  return (
    <VStack gap={8} marginY={'20px'}>
      <SwitchInput
        title={t('autoCompleteTask.title')}
        description={t('autoCompleteTask.description')}
        value={autoCompleteTask}
        defaultValue={autoCompleteTask}
        onChange={handleSwitchAutoCompleteTask}
      />

      <SwitchInput
        title={t('autoSwitchTask.title')}
        description={t('autoSwitchTask.description')}
        value={autoStartNextTask}
        defaultValue={autoStartNextTask}
        onChange={handleSwitchNextTask}
      />

      <SwitchInput
        title={t('autoOrderTask.title')}
        description={t('autoOrderTask.description')}
        value={autoOrderTasks}
        defaultValue={autoOrderTasks}
        onChange={handleSwitchOrderTasks}
      />
    </VStack>
  )
}