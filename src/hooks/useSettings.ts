import { SCUDERIAS } from '@/constants/Scuderias';
import { SessionStatusEnum } from '@/enums/SessionStatus.enum';
import { TireTypeEnum } from '@/enums/TireType.enum';
import { useAlert } from '@/hooks/useAlert';
import { Team } from '@/interfaces/Teams.interface';
import usePomodoroStore from '@/stores/Pomodoro.store';
import useSettingsStore from '@/stores/Settings.store';
import { useTranslations } from 'use-intl';

export const useSettings = () => {
  const { toastSuccess, toastError } = useAlert();
  const t = useTranslations('settings');

  const tiresSettings = useSettingsStore((state) => state.tiresSettings);
  const setTiresSettings = useSettingsStore((state) => state.setTiresSettings);
  const breaksDuration = useSettingsStore((state) => state.breaksDuration);
  const setBreaksDuration = useSettingsStore((state) => state.setBreaksDuration);

  const setAutoStartBreak = useSettingsStore((state) => state.setAutoStartBreak);
  const setAutoStartNextTask = useSettingsStore((state) => state.setAutoStartNextTask);
  const setAutoStartSession = useSettingsStore((state) => state.setAutoStartSession);
  const setCurrentScuderia = usePomodoroStore((state) => state.setCurrentScuderia);
  const setAutoCompleteTask = useSettingsStore((state) => state.setAutoCompleteTask);
  const setAutoOrderTasks = useSettingsStore((state) => state.setAutoOrderTasks);
  const setBreaksInterval = useSettingsStore((state) => state.setBreaksInterval);

  const setEnableSounds = useSettingsStore((state) => state.setEnableSounds);
  const setVolume = useSettingsStore((state) => state.setVolume);
  const setEnableNotifications = useSettingsStore((state) => state.setEnableNotifications);

  const handleSwitchSession = (value: boolean) => {
    setAutoStartSession(value);
    toastSuccess(t('settingsSaved'));
  };

  const handleSwitchBreak = (value: boolean) => {
    setAutoStartBreak(value);
    toastSuccess(t('settingsSaved'));
  };

  const handleSwitchNextTask = (value: boolean) => {
    setAutoStartNextTask(value);
    toastSuccess(t('settingsSaved'));
  };

  const handleSwitchAutoCompleteTask = (value: boolean) => {
    setAutoCompleteTask(value);
    toastSuccess(t('settingsSaved'));
  };

  const handleSwitchOrderTasks = (value: boolean) => {
    setAutoOrderTasks(value);
    toastSuccess(t('settingsSaved'));
  };

  const handleBreaksInterval = (value: number) => {
    if (value < 1) {
      toastError(t('sections.session.longBreakInterval.error'));
      return;
    }
    setBreaksInterval(value);
    toastSuccess(t('settingsSaved'));
  };

  const handleSwitchSounds = (value: boolean) => {
    setEnableSounds(value);
    toastSuccess(t('settingsSaved'));
  };

  const handleSwitchNotifications = (value: boolean) => {
    setEnableNotifications(value);
    toastSuccess(t('settingsSaved'));
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
  };

  const handleChangeBreakDuration = (type: SessionStatusEnum, duration: number) => {
    setBreaksDuration({
      ...breaksDuration,
      [type]: duration,
    });

    toastSuccess(t('settingsSaved'));
  };

  const handleChangeTireDuration = (tire: TireTypeEnum, duration: number) => {
    setTiresSettings({
      ...tiresSettings,
      [tire]: {
        ...tiresSettings[tire],
        duration,
      },
    });

    toastSuccess(t('settingsSaved'));
  };

  const changeScuderia = (scuderia: Team | string) => {
    if (typeof scuderia === 'string') {
      setCurrentScuderia(SCUDERIAS.find((team: Team) => team.id == scuderia) as Team);
    } else {
      setCurrentScuderia(scuderia);
    }
  };

  return {
    handleSwitchSounds,
    handleVolumeChange,
    handleSwitchNotifications,
    handleChangeBreakDuration,
    handleBreaksInterval,
    handleSwitchOrderTasks,
    handleSwitchAutoCompleteTask,
    handleSwitchSession,
    handleSwitchBreak,
    handleSwitchNextTask,
    changeScuderia,
    handleChangeTireDuration,
  };
};
