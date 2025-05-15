import React, { useCallback, useEffect, useRef, useState } from 'react';
import Countdown, { CountdownApi, zeroPad } from 'react-countdown';
import { Box, Center, Flex, HStack, IconButton, Text, useDisclosure } from '@chakra-ui/react';
import { GrPowerReset } from 'react-icons/gr';
import { RippleButton } from '@/components/RippleButton';
import moment from 'moment';
import { Settings } from '@/components/Pomodoro/Settings';
import useSessionStore from '@/stores/Session.store';
import { SessionStatusEnum } from '@/utils/enums/SessionStatus.enum';
import useSettingsStore from '@/stores/Settings.store';
import usePomodoroStore from '@/stores/Pomodoro.store';
import { usePomodoro } from '@/hooks/usePomodoro';
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from '@/components/ui/menu';
import { FaFlag } from 'react-icons/fa';
import { LuTimerReset } from 'react-icons/lu';
import { FlagEnum } from '@/utils/enums/Flag.enum';
import { useTranslations } from 'use-intl';
import { useAlert } from '@/hooks/useAlert';
import tinycolor from 'tinycolor2';
import { useTheme } from 'next-themes';
import { useSounds } from '@/hooks/useSounds';

export const Counter = () => {
  const status = useSessionStore((state) => state.status);
  const setStopped = useSessionStore((state) => state.setIsStopped);
  const setFlag = useSessionStore((state) => state.setFlag);
  const selectedTire = useSessionStore((state) => state.selectedTire);
  const isEndingSoon = useSessionStore((state) => state.isEndingSoon);
  const setIsEndingSoon = useSessionStore((state) => state.setIsEndingSoon);
  const tiresSettings = useSettingsStore((state) => state.tiresSettings);
  const breaksDuration = useSettingsStore((state) => state.breaksDuration);
  const extPomodoros = usePomodoroStore((state) => state.extPomodoros);
  const tasks = usePomodoroStore((state) => state.tasks);
  const resetSession = usePomodoroStore((state) => state.resetSession);
  const countdownRef = useRef<CountdownApi | null>(null);
  const currentScuderia = usePomodoroStore((state) => state.currentScuderia);
  const { handleCompleteInterval, allPomodoros, completedPomodoros, estTimeFinish } = usePomodoro();
  const { theme } = useTheme();
  const [date, setDate] = useState(Date.now() + 1000000);
  const [isActive, setIsActive] = useState(false);
  const { confirmAlert } = useAlert();
  const { open, onOpen, onClose } = useDisclosure();
  const { playSound, resumeSound, radioSound } = useSounds();
  const t = useTranslations('pomodoro');

  const darkenColor = tinycolor(currentScuderia?.colors?.primary?.dark)
    .darken(theme === 'dark' ? 15 : 0)
    .toString();

  const darkenColorDefault = tinycolor(currentScuderia?.colors?.primary?.default)
    .darken(theme === 'dark' ? 10 : 0)
    .toString();

  const isDesktop = () => {
    return !/Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  const handleTick = ({ total }: { total: number }) => {
    if (total <= 4000 && !isEndingSoon) {
      setIsEndingSoon(true);
      radioSound();

      if (isDesktop()) {
        if (Notification.permission === 'granted') {
          new Notification('Box, Box!', {
            body: 'Time to break',
            icon: '/f1-icon.png',
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
    setStopped(true);
    setIsActive(false);

    if (status === SessionStatusEnum.IN_SESSION) {
      const currentTire = tiresSettings[selectedTire];
      if (currentTire) {
        setDate(
          Date.now() + moment.duration(Number(currentTire?.duration), 'minutes').asMilliseconds()
        );
      }
    } else {
      const currentBreak = breaksDuration[status];
      if (currentBreak) {
        setDate(Date.now() + moment.duration(Number(currentBreak), 'minutes').asMilliseconds());
      }
    }
  }, [status, selectedTire, tiresSettings, breaksDuration, setStopped]);

  const handleStartClick = () => {
    countdownRef.current?.start();
    playSound();

    if (status === SessionStatusEnum.IN_SESSION) {
      setFlag(FlagEnum.GREEN);
    } else {
      setFlag(null);
    }

    setStopped(false);
    setIsActive(true);
  };

  const handlePauseClick = () => {
    countdownRef.current?.pause();
    resumeSound();
    setStopped(true);
    if (status === SessionStatusEnum.IN_SESSION) {
      setFlag(FlagEnum.YELLOW);
    } else {
      setFlag(null);
    }
    setIsActive(false);
  };

  const handleResetTimer = () => {
    const duration = moment
      .duration(Number(tiresSettings[selectedTire].duration), 'minutes')
      .asMilliseconds();

    setDate(Date.now() + duration);
    setStopped(true);
    setIsActive(false);
    setFlag(FlagEnum.RED);
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
      resetSession();
      onClose();
    }
  };

  const handleComplete = () => {
    handleIntervalComplete();
    handleCompleteInterval();
  };

  useEffect(() => {
    handleIntervalComplete();
  }, [tiresSettings, selectedTire, status, handleIntervalComplete]);

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
                onClick={handleResetClick}
                color={'fg.warning'}
                _hover={{ backgroundColor: 'fg.warning/10' }}
                value='resetTimer'
                cursor='pointer'
              >
                <LuTimerReset />
                {t('resetTimer')}
              </MenuItem>
              <MenuItem
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
            key={date}
            ref={(countdown) => {
              if (countdown) countdownRef.current = countdown.getApi();
            }}
            autoStart={false}
            onComplete={handleComplete}
            date={date}
            onTick={handleTick}
            renderer={({ minutes, seconds }) => (
              <Text fontWeight='bold' fontSize='7xl' fontFamily={'fonts.counter'}>
                {zeroPad(minutes)}:{zeroPad(seconds)}
              </Text>
            )}
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
        textColor={'light'}
        isActive={isActive}
        onClick={isActive ? handlePauseClick : handleStartClick}
        size='md'
      >
        {isActive ? t('pauseTimer') : t('startTimer')}
      </RippleButton>

      <Center>
        <Flex gap={3} color={{ base: 'gray.500', _dark: 'gray.400' }}>
          <Text fontSize='sm'>
            Pomodoros:
            {!allPomodoros.length && !extPomodoros.length && !tasks?.length && (
              <Text as='span' fontWeight='bolder' color={{ base: 'gray.800', _dark: 'gray.200' }}>
                {' '}
                0
              </Text>
            )}
            {!tasks?.length && !!extPomodoros.length && (
              <Text as='span' fontWeight='bolder' color={{ base: 'gray.800', _dark: 'gray.200' }}>
                {extPomodoros.filter((pomodoro) => pomodoro.completedAt).length}
              </Text>
            )}
            {!!allPomodoros.length && !!tasks.length && (
              <Text as='span' fontWeight='bolder' color={{ base: 'gray.800', _dark: 'gray.200' }}>
                {completedPomodoros} / {allPomodoros.length}
              </Text>
            )}
          </Text>
          <Text fontSize='sm'>
            {t('estFinishAt')}
            {': '}
            <Text as='span' fontWeight='bolder' color={{ base: 'gray.800', _dark: 'gray.200' }}>
              {estTimeFinish}
            </Text>
          </Text>
        </Flex>
      </Center>
    </React.Fragment>
  );
};
