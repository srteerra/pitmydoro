import { Box, Separator, Text } from '@chakra-ui/react';
import React from 'react';
import { Timers } from '@/components/Pomodoro/Settings/General/components/Timers';
import { Session } from '@/components/Pomodoro/Settings/General/components/Session';
import { Tasks } from '@/components/Pomodoro/Settings/General/components/Tasks';
import { Locale } from '@/components/Pomodoro/Settings/General/components/Locale';
import { Sounds } from "@/components/Pomodoro/Settings/General/components/Sounds";
import { Notifications } from "@/components/Pomodoro/Settings/General/components/Notifcations";
import { useSettings } from "@/hooks/useSettings";
import { useTranslations } from "use-intl";

export const General = () => {
  const t = useTranslations('settings');
  useSettings(true);

  const sections = [
    {
      title: t('sections.timers.title'),
      description: t('sections.timers.description'),
      component: <Timers />,
    },
    {
      title: t('sections.session.title'),
      description: t('sections.session.description'),
      component: <Session />,
    },
    {
      title: t('sections.tasks.title'),
      description: t('sections.tasks.description'),
      component: <Tasks />,
    },
    {
      title: t('sections.sounds.title'),
      description: t('sections.sounds.description'),
      component: <Sounds />,
    },
    {
      title: t('sections.notifications.title'),
      description: t('sections.notifications.description'),
      component: <Notifications />,
    },
    {
      title: t('sections.language.title'),
      description: t('sections.language.description'),
      component: <Locale />,
    },
  ];

  return (
    <Box>
      {sections.map((section, index) => (
        <React.Fragment key={index}>
          <Text fontWeight={'bold'} fontSize={'lg'}>
            {section.title}
          </Text>
          {section.component}
          {index < sections.length - 1 && <Separator marginY={'40px'} flex='1' />}
        </React.Fragment>
      ))}
    </Box>
  );
};
