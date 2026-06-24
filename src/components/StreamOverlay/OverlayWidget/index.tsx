'use client';

import React, { useEffect, useState } from 'react';
import { Box, Center, Flex, Image, Text } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { SpriteAnimation } from '@/components/SpriteAnimation';
import { OverlayConfig, OverlayTimerState } from '@/interfaces/Overlay.interface';
import { SessionStatusEnum } from '@/enums/SessionStatus.enum';
import { FlagEnum } from '@/enums/Flag.enum';
import { Locale } from '@/i18n/config';
import { jua } from '@/assets/fonts/Jua';
import { jersey15 } from '@/assets/fonts/Jersey';
import enMessages from '../../../../messages/en.json';
import esMessages from '../../../../messages/es.json';

const flash = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; }
`;

const OverlayFlag = ({ flag, scale }: { flag: FlagEnum | null; scale: number }) => {
  const [visibleFlag, setVisibleFlag] = useState<FlagEnum | null>(flag);

  useEffect(() => {
    setVisibleFlag(flag);
    if (flag && flag !== FlagEnum.YELLOW) {
      const timeout = setTimeout(() => setVisibleFlag(null), 1000);
      return () => clearTimeout(timeout);
    }
  }, [flag]);

  if (!visibleFlag) return null;

  return (
    <Image
      src={`/images/${visibleFlag}-flag.webp`}
      alt={`${visibleFlag}-flag`}
      w='auto'
      h='auto'
      maxW={`${50 * scale}px`}
      animation={`${flash} 0.5s infinite`}
    />
  );
};

interface OverlayWidgetProps {
  config: OverlayConfig;
  state: OverlayTimerState | null;
}

const buildStatusLabels = (
  status: (typeof enMessages)['streamOverlay']['status']
): Record<SessionStatusEnum, string> => ({
  [SessionStatusEnum.IN_SESSION]: status.session,
  [SessionStatusEnum.SHORT_BREAK]: status.shortBreak,
  [SessionStatusEnum.LONG_BREAK]: status.longBreak,
});

const STATUS_LABELS: Record<Locale, Record<SessionStatusEnum, string>> = {
  en: buildStatusLabels(enMessages.streamOverlay.status),
  es: buildStatusLabels(esMessages.streamOverlay.status),
};

const formatClock = (ms: number): string => {
  const totalSeconds = Math.round(Math.max(ms, 0) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const useRemainingMs = (state: OverlayTimerState | null): number => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!state?.isActive || state.endsAt === null) return;
    const interval = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(interval);
  }, [state?.isActive, state?.endsAt]);

  if (!state) return 0;
  if (state.isActive && state.endsAt !== null) return Math.max(state.endsAt - now, 0);
  return Math.max(state.remainingMs, 0);
};

export const OverlayWidget: React.FC<OverlayWidgetProps> = ({ config, state }) => {
  const remainingMs = useRemainingMs(state);
  const isActive = !!state?.isActive;
  const status = state?.status ?? SessionStatusEnum.IN_SESSION;

  const justify =
    config.align === 'top' ? 'flex-start' : config.align === 'bottom' ? 'flex-end' : 'center';

  const timerColor = config.timerColor === 'black' ? '#0c0c0c' : '#ffffff';
  const timerFontClass = config.fontStyle === 'pixel' ? jersey15.className : jua.className;

  return (
    <Flex
      width='100%'
      height='100%'
      direction='column'
      align='center'
      justify={justify}
      gap={`${24 * config.spriteScale * 0.3}px`}
      padding='40px'
    >
      {config.showTask && state?.taskTitle && (
        <Text
          maxW='80%'
          textAlign='center'
          fontWeight='semibold'
          color={timerColor}
          style={{
            fontSize: `${1.1 * config.taskScale}rem`,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {state.taskTitle}
        </Text>
      )}

      {config.showTimer && (
        <Flex direction='column' align='center' gap={1}>
          <Text
            className={timerFontClass}
            fontWeight='bold'
            color={timerColor}
            lineHeight={1}
            style={{
              fontSize: `${6 * config.timerScale}rem`,
            }}
          >
            {formatClock(remainingMs)}
          </Text>
          <Text
            textTransform='uppercase'
            letterSpacing='0.3em'
            fontWeight='semibold'
            color={timerColor}
            style={{
              fontSize: `${0.9 * config.timerScale}rem`,
              opacity: 0.85,
            }}
          >
            {(STATUS_LABELS[config.locale] ?? STATUS_LABELS.en)[status]}
          </Text>
        </Flex>
      )}

      {config.showFlag && <OverlayFlag flag={state?.flag ?? null} scale={config.spriteScale} />}

      {config.showSprite && state?.scuderia?.sprite && (
        <Center width={`${270 * config.spriteScale}px`} height={`${80 * config.spriteScale}px`}>
          <Box
            transform={`scale(${config.spriteScale})`}
            transformOrigin='center'
            style={{ imageRendering: 'pixelated' }}
          >
            <SpriteAnimation
              src={state.scuderia.sprite}
              frameHeight={80}
              frameWidth={270}
              totalFrames={6}
              paused={!isActive}
            />
          </Box>
        </Center>
      )}
    </Flex>
  );
};
