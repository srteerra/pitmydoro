import { Team } from '@/interfaces/Teams.interface';
import useSettingsStore from '@/stores/Settings.store';
import { TireTypeEnum } from '@/enums/TireType.enum';
import { SessionStatusEnum } from '@/enums/SessionStatus.enum';
import { SCUDERIAS } from '@/constants/Scuderias';
import { useAlert } from '@/hooks/useAlert';
import { useTranslations } from 'use-intl';
import { userService } from '@/services/user.service';
import { useAuth } from '@/contexts/AuthContext';
import { DefaultSettings } from '@/constants/DefaultSettings';

export const useSettings = () => {
  const { toastSuccess } = useAlert();
  const { user } = useAuth();
  const t = useTranslations('settings');

  const {
    tiresSettings,
    setTiresSettings,
    breaksDuration,
    setBreaksDuration,
    setAutoStartBreak,
    setAutoStartNextTask,
    setAutoStartSession,
    setCurrentScuderia,
    setAutoCompleteTask,
    setAutoOrderTasks,
    setBreaksInterval,
    setEnableSounds,
    setVolume,
    setSettings,
    setEnableNotifications,
  } = useSettingsStore();

  const handleSwitchSession = async (value: boolean) => {
    setAutoStartSession(value);
    if (user) await userService.updatePreferences(user.uid, { autoStartSession: value });
    toastSuccess(t('settingsSaved'));
  };

  const handleSwitchBreak = async (value: boolean) => {
    setAutoStartBreak(value);
    if (user) await userService.updatePreferences(user.uid, { autoStartBreak: value });
    toastSuccess(t('settingsSaved'));
  };

  const handleSwitchNextTask = async (value: boolean) => {
    setAutoStartNextTask(value);
    if (user) await userService.updatePreferences(user.uid, { autoStartNextTask: value });
    toastSuccess(t('settingsSaved'));
  };

  const handleSwitchAutoCompleteTask = async (value: boolean) => {
    setAutoCompleteTask(value);
    if (user) await userService.updatePreferences(user.uid, { autoCompleteTask: value });
    toastSuccess(t('settingsSaved'));
  };

  const handleSwitchOrderTasks = async (value: boolean) => {
    setAutoOrderTasks(value);
    if (user) await userService.updatePreferences(user.uid, { autoOrderTasks: value });
    toastSuccess(t('settingsSaved'));
  };

  const handleBreaksInterval = async (value: number) => {
    setBreaksInterval(value);
    if (user) await userService.updatePreferences(user.uid, { breaksInterval: value });
    toastSuccess(t('settingsSaved'));
  };

  const handleSwitchSounds = async (value: boolean) => {
    setEnableSounds(value);
    if (user) await userService.updatePreferences(user.uid, { enableSounds: value });
    toastSuccess(t('settingsSaved'));
  };

  const handleSwitchNotifications = async (value: boolean) => {
    setEnableNotifications(value);
    if (user) await userService.updatePreferences(user.uid, { enableNotifications: value });
    toastSuccess(t('settingsSaved'));
  };

  const handleVolumeChange = async (value: number) => {
    if (user) await userService.updatePreferences(user.uid, { volume: value });
    setVolume(value);
  };

  const handleChangeBreakDuration = async (type: SessionStatusEnum, duration: number) => {
    const newBreaksDurationData = {
      ...breaksDuration,
      [type]: duration,
    };

    setBreaksDuration(newBreaksDurationData);

    if (user) {
      await userService.updatePreferences(user.uid, {
        breaksDuration: newBreaksDurationData,
      });
    }

    toastSuccess(t('settingsSaved'));
  };

  const handleChangeTireDuration = async (tire: TireTypeEnum, duration: number) => {
    const newTiresSettingsData = {
      ...tiresSettings,
      [tire]: {
        ...tiresSettings[tire],
        duration,
      },
    };

    setTiresSettings(newTiresSettingsData);

    if (user) {
      await userService.updatePreferences(user.uid, {
        tiresSettings: newTiresSettingsData,
      });
    }

    toastSuccess(t('settingsSaved'));
  };

  const changeScuderia = async (scuderia: Team | string) => {
    const newScuderia =
      typeof scuderia === 'string' ? SCUDERIAS.find((team: Team) => team.id == scuderia) : scuderia;
    setCurrentScuderia(newScuderia as Team);
    if (user) await userService.updatePreferences(user.uid, { currentScuderia: newScuderia });
  };

  const resetSettings = async (userId: string) => {
    await userService.updatePreferences(userId, DefaultSettings);
  };

  const loadConfig = async (userId: string) => {
    const userData = await userService.getUserData(userId);
    if (!userData?.preferences) return;
    setSettings({ ...DefaultSettings, ...userData.preferences });
  };

  const wipeConfig = async () => {
    setSettings(DefaultSettings);
  };

  return {
    handleSwitchSounds,
    resetSettings,
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
    loadConfig,
    wipeConfig,
    handleChangeTireDuration,
  };
};
