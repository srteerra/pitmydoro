import { Box, Center, VStack, Image, Button } from '@chakra-ui/react';
import { TimerSelector } from '@/components/Pomodoro/TimerSelector';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Counter } from '@/components/Pomodoro/Counter';
import { SessionStatusEnum } from '@/utils/enums/SessionStatus.enum';
import useSessionStore from '@/stores/Session.store';
import tinycolor from 'tinycolor2';
import usePomodoroStore from '@/stores/Pomodoro.store';
import { Tasks } from '@/components/Pomodoro/Tasks';
import { SpriteAnimation } from '@/components/SpriteAnimation';
import { FlagSwitcher } from '@/components/Pomodoro/components/FlagSwitcher';
import { useTranslations } from 'use-intl';

export const Pomodoro = () => {
  const sessionStatus = useSessionStore((state) => state.status);
  const isStopped = useSessionStore((state) => state.isStopped);
  const currentScuderia = usePomodoroStore((state) => state.currentScuderia);
  const setStatus = useSessionStore((state) => state.setStatus);
  const selectedTire = useSessionStore((state) => state.selectedTire);
  const setSelectedTire = useSessionStore((state) => state.setSelectedTire);
  const t = useTranslations('pomodoro');

  const darkenColor = tinycolor(currentScuderia?.colors?.background?.[sessionStatus])
    .darken(80)
    .toString();

  const items = [
    {
      value: SessionStatusEnum.IN_SESSION,
      label: t('sessionLabel'),
    },
    {
      value: SessionStatusEnum.SHORT_BREAK,
      label: t('shortBreakLabel'),
    },
    {
      value: SessionStatusEnum.LONG_BREAK,
      label: t('longBreakLabel'),
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
      marginBottom={{ base: '0', md: '100px' }}
      display='flex'
      flexDirection='column'
      padding={{ base: '30px 10px', md: '30px 40px' }}
    >
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
          <Image
            src={currentScuderia?.logoURL}
            alt={'absolute'}
            w='auto'
            h='auto'
            style={{
              WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0) 25%, rgba(0,0,0,1) 100%)',
              maskImage: 'linear-gradient(to top, rgba(0,0,0,0) 25%, rgba(0,0,0,1) 100%)',
            }}
          />
        </Box>

        {currentScuderia &&
          <SpriteAnimation
            src={currentScuderia?.spriteURL as string}
            frameHeight={80}
            frameWidth={270}
            totalFrames={6}
            paused={isStopped}
          />
        }
      </Center>

      <VStack display={'flex'} flexDirection={'column'}>
        <TimerSelector value={selectedTire} onSelect={setSelectedTire} />
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
