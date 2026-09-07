import { Team } from '@/interfaces/Teams.interface';
import useSettingsStore from '@/stores/Settings.store';
import { TireTypeEnum } from '@/enums/TireType.enum';
import { SessionStatusEnum } from '@/enums/SessionStatus.enum';
import { SCUDERIAS } from '@/constants/Scuderias';
import { useAlert } from '@/hooks/useAlert';
import { useTranslations } from 'next-intl';
import { userService } from '@/services/user.service';
import { useAuth } from '@/contexts/AuthContext';
import { DefaultSettings } from '@/constants/DefaultSettings';
import { PomodoroMode, Settings } from '@/interfaces/Settings.interface';
import { flushElapsedTime } from '@/utils/accountElapsed.utils';
import { rebindSprite } from '@/utils/pomodoroEntry.utils';

export const useSettings = () => {
  const { toastSuccess, toastError } = useAlert();
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
    setPomodoroMode,
    setEnableNotifications,
    setEarlyAlertSeconds,
    setMinimalSessionDuration,
  } = useSettingsStore();

  const handleToggleMode = async (mode: PomodoroMode) => {
    setPomodoroMode(mode);
    if (user) await userService.updatePreferences(user.uid, { mode });
  };

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
    if (value < 1) {
      toastError(t('sections.session.longBreakInterval.error'));
      return;
    }

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

  const handleEarlyAlertSeconds = async (seconds: number) => {
    if (!Number.isInteger(seconds) || seconds < 1 || seconds > 60) {
      toastError(t('sections.notifications.earlyAlert.error'));
      return;
    }

    setEarlyAlertSeconds(seconds);
    if (user) await userService.updatePreferences(user.uid, { earlyAlertSeconds: seconds });
    toastSuccess(t('settingsSaved'));
  };

  const handleVolumeChange = async (value: number) => {
    setVolume(value);
    if (user) await userService.updatePreferences(user.uid, { volume: value });
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

  const handleChangeMinimalSessionDuration = async (duration: number) => {
    setMinimalSessionDuration(duration);

    if (user) {
      await userService.updatePreferences(user.uid, { minimalSessionDuration: duration });
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

    await flushElapsedTime(user?.uid);
    setCurrentScuderia(newScuderia as Team);
    if (newScuderia) rebindSprite((newScuderia as Team).id);

    if (user) await userService.updatePreferences(user.uid, { currentScuderia: newScuderia });
  };

  const resetSettings = async (userId: string) => {
    await userService.updatePreferences(userId, DefaultSettings);
  };

  const loadConfig = (preferences?: Partial<Settings> | null) => {
    if (!preferences) return;
    setSettings({ ...DefaultSettings, ...preferences });
  };

  const wipeConfig = async () => {
    setSettings(DefaultSettings);
  };

  return {
    handleSwitchSounds,
    resetSettings,
    handleVolumeChange,
    handleSwitchNotifications,
    handleEarlyAlertSeconds,
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
    handleToggleMode,
    handleChangeTireDuration,
    handleChangeMinimalSessionDuration,
  };
};
