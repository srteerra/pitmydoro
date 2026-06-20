import React, { useCallback, useEffect, useRef } from 'react';
import Countdown, { CountdownApi, zeroPad } from 'react-countdown';
import { Box, Center, Flex, HStack, IconButton, Text, useDisclosure } from '@chakra-ui/react';
import { GrPowerReset } from 'react-icons/gr';
import { RippleButton } from '@/components/Pomodoro/components/RippleButton';
import moment from 'moment';
import { Settings } from '@/components/Pomodoro/Settings';
import useSessionStore from '@/stores/Session.store';
import { SessionStatusEnum } from '@/enums/SessionStatus.enum';
import useSettingsStore from '@/stores/Settings.store';
import { usePomodoro } from '@/hooks/usePomodoro';
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from '@/components/ui/menu';
import { FaFlag } from 'react-icons/fa';
import { LuTimerReset } from 'react-icons/lu';
import { useTranslations } from 'use-intl';
import { useAlert } from '@/hooks/useAlert';
import tinycolor from 'tinycolor2';
import { useTheme } from 'next-themes';
import { useSounds } from '@/hooks/useSounds';
import { jua } from '@/assets/fonts/Jua';
import { useTaskStore } from '@/stores/Tasks.store';
import { useTasks } from '@/hooks/useTasks';
import { usePomodoroStore } from '@/stores/Pomodoro.store';
import { formatMs } from '@/utils/formatMs.utils';
import { TiCogOutline } from 'react-icons/ti';
import { useDialog } from '@/contexts/DialogContext';
import { PomodoroMode } from '@/interfaces/Settings.interface';

export const Counter = () => {
  const countdownRef = useRef<CountdownApi | null>(null);
  const { theme } = useTheme();
  const { confirmAlert, toastWithAction } = useAlert();
  const { resetAllTasks, undoResetAllTasks } = useTasks();
  const { openDialog } = useDialog();
  const { open, onOpen, onClose } = useDisclosure();
  const { playSound, resumeSound, radioSound } = useSounds();
  const pomodoroT = useTranslations('pomodoro');
  const settingsT = useTranslations('settings');
  const {
    incompletePomodoros,
    completedPomodoros,
    start,
    pause,
    resume,
    complete,
    reset,
    flushElapsed,
  } = usePomodoro();
  const status = useSessionStore((state) => state.status);
  const tasks = useTaskStore((state) => state.tasks);
  const tiresSettings = useSettingsStore((state) => state.tiresSettings);
  const enableNotifications = useSettingsStore((state) => state.enableNotifications);
  const breaksDuration = useSettingsStore((state) => state.breaksDuration);
  const mode = useSettingsStore((state) => state.mode);
  const minimalSessionDuration = useSettingsStore((state) => state.minimalSessionDuration);
  const selectedTire = useSessionStore((state) => state.selectedTire);
  const currentScuderia = useSettingsStore((state) => state.currentScuderia);
  const dateClock = useSessionStore((state) => state.dateClock);
  const setDateClock = useSessionStore((state) => state.setDateClock);
  const { currentPomodoro, isActive, isEndingSoon, estTimeFinish, setIsEndingSoon } =
    usePomodoroStore();

  const backButtonColor =
    theme === 'dark'
      ? tinycolor(currentScuderia?.colors?.primary?.dark)
      : tinycolor(currentScuderia?.colors?.background?.[status]);

  const buttonColor =
    theme === 'dark'
      ? tinycolor(currentScuderia?.colors?.primary?.default)
      : tinycolor(currentScuderia?.colors?.background?.[status]);

  const counterColor =
    theme === 'dark'
      ? 'white'
      : tinycolor(currentScuderia?.colors?.background?.[status]).darken(5).brighten(-30).toString();

  const darkenColor = backButtonColor
    .darken(theme === 'dark' ? 15 : 10)
    .brighten(theme === 'dark' ? 0 : -15)
    .toString();

  const darkenColorDefault = buttonColor
    .darken(theme === 'dark' ? 10 : 10)
    .brighten(theme === 'dark' ? 0 : -5)
    .toString();

  const isDesktop = () => {
    return !/Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  const handleSettingsClick = () => {
    openDialog({
      title: settingsT('title'),
      component: <Settings />,
      size: 'xl',
    });
  };

  const handleTick = ({ total }: { total: number }) => {
    const isRunning = countdownRef.current?.isStarted() && !countdownRef.current?.isPaused();
    if (!isRunning) return;

    document.title = `${formatMs(total)} - ${pomodoroT(status === SessionStatusEnum.IN_SESSION ? 'sessionLabel' : status === SessionStatusEnum.SHORT_BREAK ? 'shortBreakLabel' : 'longBreakLabel')}`;

    if (total <= 4000 && !isEndingSoon) {
      setIsEndingSoon(true);
      radioSound();
      if (isDesktop()) {
        if (Notification.permission === 'granted' && enableNotifications) {
          new Notification(pomodoroT('boxTitle'), {
            body: pomodoroT('boxDescription'),
            icon: '/f1-icon.webp',
          });
        }
      }
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    }

    if (total > 4000 && isEndingSoon) {
      setIsEndingSoon(false);
    }
  };

  const handleIntervalComplete = useCallback(() => {
    countdownRef.current?.pause();

    reset();

    if (status === SessionStatusEnum.IN_SESSION) {
      const sessionMinutes =
        mode === PomodoroMode.MINIMAL
          ? minimalSessionDuration
          : tiresSettings[selectedTire]?.duration;
      if (sessionMinutes) {
        setDateClock(
          Date.now() + moment.duration(Number(sessionMinutes), 'minutes').asMilliseconds()
        );
      }
    } else {
      const currentBreak = breaksDuration[status];
      if (currentBreak) {
        setDateClock(
          Date.now() + moment.duration(Number(currentBreak), 'minutes').asMilliseconds()
        );
      }
    }
  }, [
    status,
    selectedTire,
    tiresSettings,
    breaksDuration,
    mode,
    minimalSessionDuration,
    setDateClock,
  ]);

  const handleStartClick = async () => {
    countdownRef.current?.start();
    playSound();

    if (currentPomodoro) {
      await resume();
    } else {
      const sessionMinutes =
        mode === PomodoroMode.MINIMAL
          ? minimalSessionDuration
          : tiresSettings[selectedTire]?.duration;
      await start(status, sessionMinutes, currentScuderia);
    }
  };

  const handlePauseClick = async () => {
    countdownRef.current?.pause();
    resumeSound();
    await pause();
  };

  const handleResetTimer = async () => {
    reset(null, true);
  };

  const handleResetClick = async () => {
    if (await confirmAlert(pomodoroT('acceptReset'))) {
      handleResetTimer();
      onClose();
    }
  };

  const handleResetAllClick = async () => {
    if (await confirmAlert(pomodoroT('acceptResetAll'))) {
      handleResetTimer();
      resetAllTasks();
      toastWithAction({
        title: pomodoroT('resetAllSuccess'),
        type: 'success',
        onActionClick: async () => {
          await undoResetAllTasks();
        },
        duration: 5000,
        actionLabel: pomodoroT('undoResetAll'),
      });
      onClose();
    }
  };

  const handleComplete = () => {
    handleIntervalComplete();
    complete();
  };

  useEffect(() => {
    handleIntervalComplete();
  }, [tiresSettings, selectedTire, status, handleIntervalComplete]);

  useEffect(() => {
    if (!isActive && countdownRef.current?.isStarted() && !countdownRef.current?.isPaused()) {
      countdownRef.current?.pause();
    }
  }, [isActive]);

  useEffect(() => {
    const handleHide = () => {
      if (document.visibilityState === 'hidden') flushElapsed();
    };
    const handlePageHide = () => flushElapsed();

    document.addEventListener('visibilitychange', handleHide);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleHide);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [flushElapsed]);

  return (
    <React.Fragment>
      <HStack
        w='100'
        marginY='20px'
        padding='0 20px'
        gap={1}
        display='flex'
        justifyContent='space-between'
      >
        <Box flex={1} display='flex' justifyContent='flex-end'>
          <MenuRoot
            open={open}
            unmountOnExit={true}
            closeOnSelect={true}
            onInteractOutside={onClose}
            positioning={{ placement: 'left-start', hideWhenDetached: true }}
          >
            <MenuTrigger asChild>
              <IconButton
                data-pw-id={'reset-button'}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen();
                }}
                variant='ghost'
                size='lg'
                style={{ scale: 1.1 }}
                rounded='full'
                aria-label='Reset'
              >
                <GrPowerReset />
              </IconButton>
            </MenuTrigger>
            <MenuContent>
              <MenuItem
                data-pw-id={'reset-timer-menu-item'}
                onClick={handleResetClick}
                value='resetTimer'
                cursor='pointer'
              >
                <LuTimerReset />
                {pomodoroT('resetTimer')}
              </MenuItem>
              <MenuItem
                data-pw-id={'reset-all-menu-item'}
                onClick={handleResetAllClick}
                color='fg.error'
                _hover={{ backgroundColor: 'fg.error/10' }}
                value='resetAll'
                cursor='pointer'
              >
                <FaFlag />
                {pomodoroT('resetAll')}
              </MenuItem>
            </MenuContent>
          </MenuRoot>
        </Box>

        <Center>
          <Countdown
            key={dateClock}
            ref={(countdown) => {
              if (countdown) countdownRef.current = countdown.getApi();
            }}
            autoStart={false}
            onComplete={handleComplete}
            date={dateClock}
            onTick={handleTick}
            renderer={({ hours, minutes, seconds }) => {
              const totalMinutes = hours * 60 + minutes;
              return (
                <Text
                  fontWeight='bold'
                  style={{ fontSize: '5rem' }}
                  data-pw-id={'timer-label'}
                  color={theme === 'dark' ? 'white' : counterColor}
                  className={jua.className}
                >
                  {zeroPad(totalMinutes)}:{zeroPad(seconds)}
                </Text>
              );
            }}
          />
        </Center>

        <Box flex={1} display='flex' justifyContent='flex-start'>
          <IconButton
            onClick={handleSettingsClick}
            variant='ghost'
            size='lg'
            style={{ scale: 1.1 }}
            rounded='full'
            aria-label='Settings'
          >
            <TiCogOutline />
          </IconButton>
        </Box>
      </HStack>

      <RippleButton
        marginY='20px'
        fontWeight='semibold'
        buttonColor={darkenColor}
        spanColor={darkenColorDefault}
        textColor={theme === 'dark' ? 'dark.200' : 'light'}
        isActive={isActive}
        onClick={isActive ? handlePauseClick : handleStartClick}
        size='md'
      >
        {isActive ? pomodoroT('pauseTimer') : pomodoroT('startTimer')}
      </RippleButton>

      <Center>
        <Flex gap={3} color={{ base: 'gray.500', _dark: 'gray.400' }}>
          <Text fontSize='sm'>
            {!tasks?.length && (
              <Text as={'span'} marginRight={2}>
                {pomodoroT('noPomodoros')}
              </Text>
            )}

            {!!tasks.length && (
              <>
                <Text as={'span'} marginRight={2}>
                  Pomodoros:
                </Text>

                <Text as='span' fontWeight='bolder' color={{ base: 'gray.800', _dark: 'gray.200' }}>
                  {completedPomodoros} / {incompletePomodoros}
                </Text>
              </>
            )}
          </Text>
          <Text as={'p'} fontSize='sm'>
            {pomodoroT('estFinishAt')}
            {': '}
            <Text as='span' fontWeight='bolder' color={{ base: 'gray.800', _dark: 'gray.200' }}>
              {estTimeFinish || '--:--'}
            </Text>
          </Text>
        </Flex>
      </Center>
    </React.Fragment>
  );
};
