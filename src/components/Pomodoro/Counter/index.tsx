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
import _ from 'lodash';
import { useTaskStore } from '@/stores/Tasks.store';
import { useTasks } from '@/hooks/useTasks';
import { usePomodoroStore } from '@/stores/Pomodoro.store';

export const Counter = () => {
  const status = useSessionStore((state) => state.status);
  const tasks = useTaskStore((state) => state.tasks);
  const tiresSettings = useSettingsStore((state) => state.tiresSettings);
  const enableNotifications = useSettingsStore((state) => state.enableNotifications);
  const breaksDuration = useSettingsStore((state) => state.breaksDuration);
  const selectedTire = useSessionStore((state) => state.selectedTire);
  const currentScuderia = useSettingsStore((state) => state.currentScuderia);
  const dateClock = useSessionStore((state) => state.dateClock);
  const setDateClock = useSessionStore((state) => state.setDateClock);
  const { currentPomodoro, isActive, isEndingSoon, estTimeFinish, setIsEndingSoon } =
    usePomodoroStore();

  const countdownRef = useRef<CountdownApi | null>(null);
  const { theme } = useTheme();

  const { confirmAlert } = useAlert();
  const { resetAllTasks } = useTasks();
  const { open, onOpen, onClose } = useDisclosure();
  const { playSound, resumeSound, radioSound } = useSounds();
  const t = useTranslations('pomodoro');

  const { incompletePomodoros, start, pause, resume, complete, reset } = usePomodoro();

  const completedPomodoros = _.chain(tasks).filter('completedAt').sumBy('totalPomodoros').value();

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

  const handleTick = ({ total }: { total: number }) => {
    const isRunning = countdownRef.current?.isStarted() && !countdownRef.current?.isPaused();
    if (!isRunning) return;

    if (total <= 4000 && !isEndingSoon) {
      setIsEndingSoon(true);
      radioSound();
      if (isDesktop()) {
        if (Notification.permission === 'granted' && enableNotifications) {
          new Notification(t('boxTitle'), {
            body: t('boxDescription'),
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
      const currentTire = tiresSettings[selectedTire];
      if (currentTire) {
        setDateClock(
          Date.now() + moment.duration(Number(currentTire?.duration), 'minutes').asMilliseconds()
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
  }, [status, selectedTire, tiresSettings, breaksDuration, setDateClock]);

  const handleStartClick = async () => {
    countdownRef.current?.start();
    playSound();

    if (currentPomodoro) {
      await resume();
    } else {
      await start(status, tiresSettings[selectedTire]?.duration, currentScuderia);
    }
  };

  const handlePauseClick = async () => {
    countdownRef.current?.pause();
    resumeSound();
    await pause();
  };

  const handleResetTimer = async () => {
    const newTime =
      status === SessionStatusEnum.LONG_BREAK
        ? breaksDuration[SessionStatusEnum.LONG_BREAK]
        : status === SessionStatusEnum.SHORT_BREAK
          ? breaksDuration[SessionStatusEnum.SHORT_BREAK]
          : tiresSettings[selectedTire].duration;

    const duration = moment.duration(Number(newTime), 'minutes').asMilliseconds();
    setDateClock(Date.now() + duration);

    await pause();
  };

  const handleResetClick = async () => {
    if (await confirmAlert(t('acceptReset'))) {
      handleResetTimer();
      onClose();
    }
  };

  const handleResetAllClick = async () => {
    if (await confirmAlert(t('acceptResetAll'))) {
      handleResetTimer();
      resetAllTasks();
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
                size='md'
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
                {t('resetTimer')}
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
                {t('resetAll')}
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
                  fontSize='7xl'
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
          <Settings />
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
        {isActive ? t('pauseTimer') : t('startTimer')}
      </RippleButton>

      <Center>
        <Flex gap={3} color={{ base: 'gray.500', _dark: 'gray.400' }}>
          <Text fontSize='sm'>
            <Text as={'span'} marginRight={2}>
              Pomodoros:
            </Text>
            {!!tasks.length && (
              <Text as='span' fontWeight='bolder' color={{ base: 'gray.800', _dark: 'gray.200' }}>
                {completedPomodoros} / {incompletePomodoros}
              </Text>
            )}
          </Text>
          <Text as={'p'} fontSize='sm'>
            {t('estFinishAt')}
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
