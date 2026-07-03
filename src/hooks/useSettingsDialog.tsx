import { useTranslations } from 'use-intl';
import { useDialog } from '@/contexts/DialogContext';
import { Settings, Tab } from '@/components/Pomodoro/Settings';

export const useSettingsDialog = () => {
  const { openDialog } = useDialog();
  const settingsT = useTranslations('settings');

  const openSettings = (initialTab: Tab = Tab.GENERAL) => {
    openDialog({
      title: settingsT('title'),
      component: <Settings initialTab={initialTab} />,
      size: 'xl',
    });
  };

  return { openSettings };
};
