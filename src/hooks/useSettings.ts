import { ITeam } from '@/interfaces/Teams.interface';
import usePomodoroStore from '@/stores/Pomodoro.store';
import useSettingsStore from '@/stores/Settings.store';
import { TireTypeEnum } from '@/utils/enums/TireType.enum';
import { SessionStatusEnum } from '@/utils/enums/SessionStatus.enum';
import useTeamsStore from '@/stores/Teams.store';

export const useSettings = () => {
  const teams = useTeamsStore((state) => state.teams);
  const currentScuderia = usePomodoroStore((state) => state.currentScuderia);
  const tiresSettings = useSettingsStore((state) => state.tiresSettings);
  const setTiresSettings = useSettingsStore((state) => state.setTiresSettings);
  const breaksDuration = useSettingsStore((state) => state.breaksDuration);
  const setBreaksDuration = useSettingsStore((state) => state.setBreaksDuration);
  const autoStartSession = useSettingsStore((state) => state.autoStartSession);
  const autoStartBreak = useSettingsStore((state) => state.autoStartBreak);
  const autoStartNextTask = useSettingsStore((state) => state.autoStartNextTask);
  const autoOrderTasks = useSettingsStore((state) => state.autoOrderTasks);
  const autoCompleteTask = useSettingsStore((state) => state.autoCompleteTask);
  const breaksInterval = useSettingsStore((state) => state.breaksInterval);

  const setAutoStartBreak = useSettingsStore((state) => state.setAutoStartBreak);
  const setAutoStartNextTask = useSettingsStore((state) => state.setAutoStartNextTask);
  const setAutoStartSession = useSettingsStore((state) => state.setAutoStartSession);
  const setCurrentScuderia = usePomodoroStore((state) => state.setCurrentScuderia);
  const setAutoCompleteTask = useSettingsStore((state) => state.setAutoCompleteTask);
  const setAutoOrderTasks = useSettingsStore((state) => state.setAutoOrderTasks);
  const setBreaksInterval = useSettingsStore((state) => state.setBreaksInterval);

  const enableSounds = useSettingsStore((state) => state.enableSounds);
  const enableNotifications = useSettingsStore((state) => state.enableNotifications);
  const setEnableSounds = useSettingsStore((state) => state.setEnableSounds);
  const setEnableNotifications = useSettingsStore((state) => state.setEnableNotifications);

  const handleSwitchSession = (value: boolean) => {
    setAutoStartSession(value);
  };

  const handleSwitchBreak = (value: boolean) => {
    setAutoStartBreak(value);
  };

  const handleSwitchNextTask = (value: boolean) => {
    setAutoStartNextTask(value);
  };

  const handleSwitchAutoCompleteTask = (value: boolean) => {
    setAutoCompleteTask(value);
  };

  const handleSwitchOrderTasks = (value: boolean) => {
    setAutoOrderTasks(value);
  };

  const handleBreaksInterval = (value: number) => {
    setBreaksInterval(value);
  };

  const handleSwitchSounds = (value: boolean) => {
    setEnableSounds(value);
  };

  const handleSwitchNotifications = (value: boolean) => {
    setEnableNotifications(value);
  };

  const handleChangeBreakDuration = (type: SessionStatusEnum, duration: number) => {
    setBreaksDuration({
      ...breaksDuration,
      [type]: duration,
    });
  };

  const handleChangeTireDuration = (tire: TireTypeEnum, duration: number) => {
    setTiresSettings({
      ...tiresSettings,
      [tire]: {
        ...tiresSettings[tire],
        duration,
      },
    });
  };

  const changeScuderia = (scuderia: ITeam | string) => {
    if (typeof scuderia === 'string') {
      setCurrentScuderia(teams.find((team: ITeam) => team.id == scuderia) as ITeam);
    } else {
      setCurrentScuderia(scuderia);
    }
  };

  return {
    currentScuderia,
    teams,
    autoStartSession,
    autoStartBreak,
    autoStartNextTask,
    autoOrderTasks,
    autoCompleteTask,
    breaksInterval,
    tiresSettings,
    breaksDuration,
    enableNotifications,
    enableSounds,
    handleSwitchSounds,
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
