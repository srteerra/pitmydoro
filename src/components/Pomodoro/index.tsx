import { useEffect, useState } from 'react';
import { Box, Center, IconButton, Image, Loader, Text, VStack } from '@chakra-ui/react';
import { LuMinimize2 } from 'react-icons/lu';
import { TimerSelector } from '@/components/Pomodoro/TimerSelector';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Counter } from '@/components/Pomodoro/Counter';
import { SessionStatusEnum } from '@/enums/SessionStatus.enum';
import useSessionStore from '@/stores/Session.store';
import tinycolor from 'tinycolor2';
import { Tasks } from '@/components/Pomodoro/Tasks';
import { SpriteAnimation } from '@/components/SpriteAnimation';
import { FlagSwitcher } from '@/components/Pomodoro/components/FlagSwitcher';
import { StickyNotes } from '@/components/StickyNotes';
import { Projects } from '@/components/Projects';
import { Tab } from '@/components/Pomodoro/Settings';
import { useSettingsDialog } from '@/hooks/useSettingsDialog';
import { useTranslations } from 'next-intl';
import { SCUDERIAS } from '@/constants/Scuderias';
import useSettingsStore from '@/stores/Settings.store';
import { usePomodoroStore } from '@/stores/Pomodoro.store';
import { usePomodoro } from '@/hooks/usePomodoro';
import { PomodoroMode } from '@/interfaces/Settings.interface';
import { useTheme } from 'next-themes';
import { TireTypeEnum } from '@/enums/TireType.enum';
import { Rain } from '@/components/Rain';
import { RainSoundControls } from '@/components/Rain/RainSoundControls';
import { useRainSound } from '@/hooks/useRainSound';
import { RAIN_LOOKS, RainIntensity } from '@/constants/Rain';
import { CAR_ENTRY_ANIMATION } from '@/constants/Animations';
import { useTaskStore } from '@/stores/Tasks.store';
import { useSimpleDisplay } from '@/hooks/useSimpleDisplay';

// Above the simple display layer (Chakra's `overlay` z-index is 1300).
const SIMPLE_DISPLAY_RAIN_Z_INDEX = 1301;

export const Pomodoro = () => {
  const sessionStatus = useSessionStore((state) => state.status);
  const isActive = usePomodoroStore((state) => state.isActive);
  const currentScuderia = useSettingsStore((state) => state.currentScuderia);
  const mode = useSettingsStore((state) => state.mode);
  const setStatus = useSessionStore((state) => state.setStatus);
  const selectedTire = useSessionStore((state) => state.selectedTire);
  const t = useTranslations('pomodoro');
  const settingsT = useTranslations('settings');
  const { changeCompoundTime, confirmInterruptIfRunning } = usePomodoro();
  const { openSettings } = useSettingsDialog();
  const { isSimpleDisplay, exitSimpleDisplay } = useSimpleDisplay();
  const currentTaskTitle = useTaskStore((state) => state.currentTask?.title);
  const { theme } = useTheme();

  const handleStatusChange = async (value: SessionStatusEnum) => {
    if (!(await confirmInterruptIfRunning())) return;
    setStatus(value);
  };

  const isDarkTheme = theme === 'dark';

  const rainIntensity: RainIntensity | null =
    mode !== PomodoroMode.F1
      ? null
      : selectedTire === TireTypeEnum.WET
        ? 'wet'
        : selectedTire === TireTypeEnum.INTERMEDIATE
          ? 'intermediate'
          : null;

  useRainSound(rainIntensity);

  useEffect(() => exitSimpleDisplay, [exitSimpleDisplay]);

  const [shownIntensity, setShownIntensity] = useState<RainIntensity | null>(null);

  useEffect(() => {
    if (rainIntensity) setShownIntensity(rainIntensity);
  }, [rainIntensity]);

  const rainLook = shownIntensity ? RAIN_LOOKS[shownIntensity] : null;
  const rainColor = isDarkTheme ? '#dbe9ff' : '#3f4a5e';

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
      position='relative'
      width={{ base: '100%', md: '600px' }}
      margin='auto'
      marginBottom={{ base: '0', md: '50px' }}
    >
      {rainLook && (
        <Rain
          fullscreen
          zIndex={isSimpleDisplay ? SIMPLE_DISPLAY_RAIN_Z_INDEX : undefined}
          present={!!rainIntensity}
          vignette={rainLook.vignette && !isDarkTheme}
          color={rainColor}
          opacity={isDarkTheme ? rainLook.opacity.dark : rainLook.opacity.light}
          amount={rainLook.amount}
          speed={rainLook.speed}
          wind={rainLook.wind}
          dropLength={rainLook.dropLength}
        />
      )}

      <RainSoundControls intensity={rainIntensity} />

      <StickyNotes />

      <Projects />

      <Box
        rounded='3xl'
        bg='white'
        backgroundColor={{
          base: 'transparent',
          md: 'gray.50',
          _dark: { base: 'transparent', md: 'dark.200' },
        }}
        boxShadow={{ base: 'none', md: 'md' }}
        width='100%'
        display='flex'
        flexDirection='column'
        position='relative'
        zIndex={1}
        padding={{ base: '30px 10px', md: '30px 40px' }}
        {...(isSimpleDisplay && {
          'data-pw-id': 'simple-display',
          position: 'fixed',
          inset: 0,
          zIndex: 'overlay',
          rounded: 'none',
          boxShadow: 'none',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: {
            base: currentScuderia?.colors?.background?.[sessionStatus] ?? 'background.light',
            _dark: 'background.dark',
          },
        })}
      >
        {isSimpleDisplay && (
          <IconButton
            data-pw-id='simple-display-exit'
            onClick={exitSimpleDisplay}
            variant='ghost'
            size='lg'
            rounded='full'
            position='absolute'
            top={4}
            right={4}
            aria-label={t('exitSimpleDisplay')}
          >
            <LuMinimize2 />
          </IconButton>
        )}

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
                    WebkitMaskImage:
                      'linear-gradient(to top, rgba(0,0,0,0) 25%, rgba(0,0,0,1) 100%)',
                    maskImage: 'linear-gradient(to top, rgba(0,0,0,0) 25%, rgba(0,0,0,1) 100%)',
                  }}
                />
              )}
            </Box>

            {currentScuderia && (
              <Box
                position='relative'
                zIndex='2'
                {...(!isSimpleDisplay && {
                  cursor: 'pointer',
                  onClick: () => openSettings(Tab.SCUDERIA),
                  role: 'button',
                  'aria-label': settingsT('scuderia'),
                  transition: 'transform 0.2s',
                  _hover: { transform: 'scale(1.05)' },
                })}
              >
                <Box
                  key={currentScuderia.id}
                  animation={CAR_ENTRY_ANIMATION}
                  _motionReduce={{ animation: 'none' }}
                >
                  <SpriteAnimation
                    src={currentScuderia?.spriteURL as string}
                    frameHeight={80}
                    frameWidth={270}
                    totalFrames={6}
                    paused={!isActive}
                  />
                </Box>
              </Box>
            )}
          </Center>
        )}

        <VStack display={isSimpleDisplay ? 'none' : 'flex'} flexDirection={'column'}>
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
              onValueChange={(e) => handleStatusChange(e.value as SessionStatusEnum)}
              backgroundColor={'transparent'}
              shadow={'none'}
              border={'none'}
              outline={'none'}
            />
          </Center>
        </VStack>

        <Counter />

        {isSimpleDisplay && currentTaskTitle && (
          <Text
            data-pw-id='simple-display-task'
            fontSize={{ base: '2xl', md: '4xl' }}
            fontWeight='semibold'
            textAlign='center'
            maxWidth='90%'
            flexShrink={0}
            lineClamp={2}
            color={{ base: 'gray.800', _dark: 'gray.200' }}
          >
            {currentTaskTitle}
          </Text>
        )}

        {!isSimpleDisplay && <Tasks />}
      </Box>
    </Box>
  );
};
