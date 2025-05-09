'use client';
import { Flex, Text } from '@chakra-ui/react';
import React from 'react';
import { LocaleSwitch } from '@/components/Toggles/LocaleSwitch';
import { useTranslations } from "use-intl";

export const Locale = () => {
  const t = useTranslations('settings.sections.language');

  return (
    <Flex textAlign={"start"} marginY={'20px'} alignItems='center' gap={4}>
      <Text>
        {t('changeLanguage.title')}
      </Text>
      <LocaleSwitch portalDisabled />
    </Flex>
  );
};
