import { Box, Center, Image, Loader, VStack } from '@chakra-ui/react';
import { TimerSelector } from '@/components/Pomodoro/TimerSelector';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Counter } from '@/components/Pomodoro/Counter';
import { SessionStatusEnum } from '@/enums/SessionStatus.enum';
import useSessionStore from '@/stores/Session.store';
import tinycolor from 'tinycolor2';
import { Tasks } from '@/components/Pomodoro/Tasks';
import { SpriteAnimation } from '@/components/SpriteAnimation';
import { FlagSwitcher } from '@/components/Pomodoro/components/FlagSwitcher';
import { Settings, Tab } from '@/components/Pomodoro/Settings';
import { useDialog } from '@/contexts/DialogContext';
import { useTranslations } from 'use-intl';
import { SCUDERIAS } from '@/constants/Scuderias';
import useSettingsStore from '@/stores/Settings.store';
import { usePomodoroStore } from '@/stores/Pomodoro.store';
import { usePomodoro } from '@/hooks/usePomodoro';
import { PomodoroMode } from '@/interfaces/Settings.interface';

export const Pomodoro = () => {
  const sessionStatus = useSessionStore((state) => state.status);
  const isActive = usePomodoroStore((state) => state.isActive);
  const currentScuderia = useSettingsStore((state) => state.currentScuderia);
  const mode = useSettingsStore((state) => state.mode);
  const setStatus = useSessionStore((state) => state.setStatus);
  const selectedTire = useSessionStore((state) => state.selectedTire);
  const t = useTranslations('pomodoro');
  const settingsT = useTranslations('settings');
  const { changeCompoundTime } = usePomodoro();
  const { openDialog } = useDialog();

  const handleScuderiaClick = () => {
    openDialog({
      title: settingsT('title'),
      component: <Settings initialTab={Tab.SCUDERIA} />,
      size: 'xl',
    });
  };

  const darkenColor = tinycolor(currentScuderia?.colors?.background?.[sessionStatus])
    .darken(80)
    .toString();

  const items = [
    {
      value: SessionStatusEnum.IN_SESSION,
      label: t('sessionLabel'),
      testId: 'session-label',
    },
    {
      value: SessionStatusEnum.SHORT_BREAK,
      label: t('shortBreakLabel'),
      testId: 'short-break-label',
    },
    {
      value: SessionStatusEnum.LONG_BREAK,
      label: t('longBreakLabel'),
      testId: 'long-break-label',
    },
  ];

  return (
    <Box
      rounded='3xl'
      bg='white'
      backgroundColor={{
        base: 'transparent',
        md: 'gray.50',
        _dark: { base: 'transparent', md: 'dark.200' },
      }}
      boxShadow={{ base: 'none', md: 'md' }}
      width={{ base: '100%', md: '600px' }}
      margin='auto'
      marginBottom={{ base: '0', md: '50px' }}
      display='flex'
      flexDirection='column'
      padding={{ base: '30px 10px', md: '30px 40px' }}
    >
      {mode === PomodoroMode.F1 && (
        <Center marginBottom={'10px'} marginTop={{ base: '0', md: '50px' }} position='relative'>
          <Box
            position='absolute'
            top='10%'
            left='40%'
            height={'auto'}
            transform='translate(-50%, -50%)'
            display='inline-block'
          >
            <FlagSwitcher />
          </Box>

          <Box
            position='absolute'
            top='10%'
            left='50%'
            height={'auto'}
            transform='translate(-50%, -50%)'
            display='inline-block'
          >
            {!SCUDERIAS?.length || !currentScuderia?.logoURL ? (
              <Loader opacity={0.6} width={40} height={40} />
            ) : (
              <Image
                src={currentScuderia?.logoURL}
                data-pw-id={'scuderia-logo'}
                alt={'scuderia-logo'}
                w='auto'
                h='auto'
                style={{
                  WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0) 25%, rgba(0,0,0,1) 100%)',
                  maskImage: 'linear-gradient(to top, rgba(0,0,0,0) 25%, rgba(0,0,0,1) 100%)',
                }}
              />
            )}
          </Box>

          {currentScuderia && (
            <Box
              position='relative'
              zIndex='2'
              cursor='pointer'
              onClick={handleScuderiaClick}
              role='button'
              aria-label={settingsT('scuderia')}
              transition='transform 0.2s'
              _hover={{ transform: 'scale(1.05)' }}
            >
              <SpriteAnimation
                src={currentScuderia?.spriteURL as string}
                frameHeight={80}
                frameWidth={270}
                totalFrames={6}
                paused={!isActive}
              />
            </Box>
          )}
        </Center>
      )}

      <VStack display={'flex'} flexDirection={'column'}>
        {mode === PomodoroMode.F1 && (
          <TimerSelector value={selectedTire} onSelect={changeCompoundTime} />
        )}

        <Center w={'100%'}>
          <SegmentedControl
            size={'md'}
            defaultValue='session'
            items={items}
            isActive={sessionStatus}
            cursor={'pointer'}
            value={sessionStatus}
            activeBgColor={darkenColor}
            onValueChange={(e) => setStatus(e.value as SessionStatusEnum)}
            backgroundColor={'transparent'}
            shadow={'none'}
            border={'none'}
            outline={'none'}
          />
        </Center>
      </VStack>

      <Counter />
      <Tasks />
    </Box>
  );
};
