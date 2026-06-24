'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Center, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { FiCheck, FiCopy, FiExternalLink } from 'react-icons/fi';
import { LuMonitorPlay } from 'react-icons/lu';
import { useTranslations } from 'use-intl';
import { useAuth } from '@/contexts/AuthContext';
import { useOverlayStore } from '@/stores/Overlay.store';
import { useOverlayDoc } from '@/hooks/useOverlayDoc';
import { OverlayWidget } from '@/components/StreamOverlay/OverlayWidget';
import { OverlayConfig, OverlayTimerState } from '@/interfaces/Overlay.interface';
import { overlayService } from '@/services/overlay.service';
import { buildWidgetUrl, DEFAULT_OVERLAY_CONFIG } from '@/utils/overlay/overlayConfig';
import { SessionStatusEnum } from '@/enums/SessionStatus.enum';
import { PomodoroMode } from '@/interfaces/Settings.interface';

const SegButton = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <Button
    size='sm'
    flex={1}
    variant={active ? 'solid' : 'outline'}
    colorPalette={active ? 'brand' : 'gray'}
    onClick={onClick}
    rounded='lg'
  >
    {children}
  </Button>
);

const RangeRow = ({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (value: number) => void;
}) => (
  <Box>
    <Flex justify='space-between' mb={1}>
      <Text fontSize='sm' fontWeight='medium'>
        {label}
      </Text>
      <Text fontSize='sm' color='gray.500'>
        {value}
        {suffix}
      </Text>
    </Flex>
    <input
      type='range'
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ width: '100%', accentColor: 'var(--chakra-colors-brand-500)' }}
    />
  </Box>
);

const GUIDE_STEPS = ['install', 'source', 'paste', 'size', 'sync'] as const;

const PREVIEW_WIDTH = 1280;
const PREVIEW_HEIGHT = 720;

const PreviewSurface = ({
  config,
  state,
  label,
}: {
  config: OverlayConfig;
  state: OverlayTimerState | null;
  label: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? el.clientWidth;
      setScale(width / PREVIEW_WIDTH);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      ref={ref}
      flex={1}
      alignSelf='flex-start'
      width='100%'
      aspectRatio={16 / 9}
      rounded='2xl'
      overflow='hidden'
      position='relative'
      style={{
        backgroundColor: '#2a2a2a',
        backgroundImage:
          'linear-gradient(45deg, #1f1f1f 25%, transparent 25%), linear-gradient(-45deg, #1f1f1f 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1f1f1f 75%), linear-gradient(-45deg, transparent 75%, #1f1f1f 75%)',
        backgroundSize: '24px 24px',
        backgroundPosition: '0 0, 0 12px, 12px -12px, -12px 0',
      }}
    >
      <Box
        position='absolute'
        top={0}
        left={0}
        width={`${PREVIEW_WIDTH}px`}
        height={`${PREVIEW_HEIGHT}px`}
        opacity={scale ? 1 : 0}
        style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
      >
        <OverlayWidget config={config} state={state} />
      </Box>
      <Text
        position='absolute'
        top={3}
        left={4}
        fontSize='xs'
        color='whiteAlpha.700'
        letterSpacing='wide'
      >
        {label}
      </Text>
    </Box>
  );
};

export const OverlayConfigurator = () => {
  const { user } = useAuth();
  const t = useTranslations('streamOverlay');
  const token = useOverlayStore((state) => state.token);
  const enabled = useOverlayStore((state) => state.enabled);
  const ensure = useOverlayStore((state) => state.ensure);
  const setEnabled = useOverlayStore((state) => state.setEnabled);

  const doc = useOverlayDoc(token || null);
  const [copied, setCopied] = useState(false);
  const [localConfig, setLocalConfig] = useState<OverlayConfig | null>(null);
  const seededRef = useRef(false);
  const writeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!seededRef.current && doc?.config) {
      setLocalConfig({ ...DEFAULT_OVERLAY_CONFIG, ...doc.config });
      seededRef.current = true;
    }
  }, [doc?.config]);

  const config = localConfig ?? { ...DEFAULT_OVERLAY_CONFIG, ...(doc?.config ?? {}) };

  const previewState: OverlayTimerState | null = doc
    ? {
        isActive: !!doc.isActive,
        status: doc.status ?? SessionStatusEnum.IN_SESSION,
        endsAt: doc.endsAt ?? null,
        remainingMs: doc.remainingMs ?? 0,
        scuderia: doc.scuderia ?? null,
        taskTitle: doc.taskTitle ?? null,
        flag: doc.flag ?? null,
        mode: doc.mode ?? PomodoroMode.F1,
      }
    : null;

  const update = (partial: Partial<OverlayConfig>) => {
    const next = { ...config, ...partial };
    setLocalConfig(next);
    if (!user || !token) return;
    if (writeTimer.current) clearTimeout(writeTimer.current);
    writeTimer.current = setTimeout(() => {
      void overlayService.publishConfig(token, next);
    }, 500);
  };

  const handleToggleEnabled = async (value: boolean) => {
    if (!user) return;
    if (value && !token) await ensure(user.uid, config);
    await setEnabled(user.uid, value);
  };

  const widgetUrl = useMemo(() => (token ? buildWidgetUrl(token) : ''), [token]);

  const handleCopy = async () => {
    if (!widgetUrl) return;
    try {
      await navigator.clipboard.writeText(widgetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <VStack align='stretch' gap={8}>
      <Flex direction={{ base: 'column', lg: 'row' }} gap={6} align='stretch'>
        <PreviewSurface config={config} state={previewState} label={t('config.previewLabel')} />

        <VStack flex={1} align='stretch' gap={5} maxW={{ lg: '380px' }}>
          <Flex
            align='center'
            justify='space-between'
            p={3}
            rounded='xl'
            borderWidth='1px'
            borderColor={enabled ? 'gray.800' : { base: 'gray.200', _dark: 'whiteAlpha.200' }}
          >
            <Box>
              <Text fontSize='sm' fontWeight='semibold'>
                {t('config.sync.title')}
              </Text>
              <Text fontSize='xs' color='gray.500'>
                {enabled ? t('config.sync.on') : t('config.sync.off')}
              </Text>
            </Box>
            <Button
              size='sm'
              rounded='full'
              colorPalette={enabled ? 'brand' : 'gray'}
              variant={enabled ? 'solid' : 'outline'}
              onClick={() => handleToggleEnabled(!enabled)}
            >
              {enabled ? t('config.sync.stateOn') : t('config.sync.stateOff')}
            </Button>
          </Flex>

          <VStack
            align='stretch'
            gap={5}
            opacity={enabled ? 1 : 0.45}
            pointerEvents={enabled ? 'auto' : 'none'}
            aria-disabled={!enabled}
            transition='opacity 0.2s ease'
          >
            <RangeRow
              label={t('config.spriteSize')}
              value={config.spriteScale}
              min={1}
              max={6}
              step={0.5}
              suffix='x'
              onChange={(value) => update({ spriteScale: value })}
            />
            <RangeRow
              label={t('config.timerSize')}
              value={config.timerScale}
              min={0.5}
              max={2.5}
              step={0.1}
              suffix='x'
              onChange={(value) => update({ timerScale: value })}
            />
            <RangeRow
              label={t('config.taskSize')}
              value={config.taskScale}
              min={0.5}
              max={3}
              step={0.1}
              suffix='x'
              onChange={(value) => update({ taskScale: value })}
            />

            <Box>
              <Text fontSize='sm' fontWeight='semibold' mb={2}>
                {t('config.elements.title')}
              </Text>
              <HStack gap={2}>
                <SegButton
                  active={config.showTimer}
                  onClick={() => update({ showTimer: !config.showTimer })}
                >
                  {t('config.elements.timer')}
                </SegButton>
                <SegButton
                  active={config.showSprite}
                  onClick={() => update({ showSprite: !config.showSprite })}
                >
                  {t('config.elements.car')}
                </SegButton>
                <SegButton
                  active={config.showTask}
                  onClick={() => update({ showTask: !config.showTask })}
                >
                  {t('config.elements.task')}
                </SegButton>
                <SegButton
                  active={config.showFlag}
                  onClick={() => update({ showFlag: !config.showFlag })}
                >
                  {t('config.elements.flag')}
                </SegButton>
              </HStack>
            </Box>

            <Box>
              <Text fontSize='sm' fontWeight='semibold' mb={2}>
                {t('config.labelLanguage')}
              </Text>
              <HStack gap={2}>
                <SegButton active={config.locale === 'en'} onClick={() => update({ locale: 'en' })}>
                  English
                </SegButton>
                <SegButton active={config.locale === 'es'} onClick={() => update({ locale: 'es' })}>
                  Español
                </SegButton>
              </HStack>
            </Box>

            <Box>
              <Text fontSize='sm' fontWeight='semibold' mb={2}>
                {t('config.verticalAlign.title')}
              </Text>
              <HStack gap={2}>
                {(['top', 'center', 'bottom'] as const).map((value) => (
                  <SegButton
                    key={value}
                    active={config.align === value}
                    onClick={() => update({ align: value })}
                  >
                    {t(`config.verticalAlign.${value}`)}
                  </SegButton>
                ))}
              </HStack>
            </Box>

            <Box>
              <Text fontSize='sm' fontWeight='semibold' mb={2}>
                {t('config.timerColor.title')}
              </Text>
              <HStack gap={2}>
                {(['auto', 'white', 'black'] as const).map((value) => (
                  <SegButton
                    key={value}
                    active={config.timerColor === value}
                    onClick={() => update({ timerColor: value })}
                  >
                    {t(`config.timerColor.${value}`)}
                  </SegButton>
                ))}
              </HStack>
            </Box>

            <Box>
              <Text fontSize='sm' fontWeight='semibold' mb={2}>
                {t('config.fontStyle.title')}
              </Text>
              <HStack gap={2}>
                {(['neutral', 'pixel'] as const).map((value) => (
                  <SegButton
                    key={value}
                    active={config.fontStyle === value}
                    onClick={() => update({ fontStyle: value })}
                  >
                    {t(`config.fontStyle.${value}`)}
                  </SegButton>
                ))}
              </HStack>
            </Box>
          </VStack>

          <Box
            borderTopWidth='1px'
            borderColor={{ base: 'gray.200', _dark: 'whiteAlpha.200' }}
            pt={4}
          >
            <Text fontSize='sm' fontWeight='semibold' mb={2}>
              {t('config.url.title')}
            </Text>
            <HStack gap={2}>
              <Button
                flex={1}
                colorPalette='brand'
                onClick={handleCopy}
                rounded='lg'
                disabled={!widgetUrl}
              >
                {copied ? <FiCheck /> : <FiCopy />}
                {copied ? t('config.url.copied') : t('config.url.copy')}
              </Button>
              <Button asChild variant='outline' rounded='lg' disabled={!widgetUrl}>
                <a href={widgetUrl || '#'} target='_blank' rel='noopener noreferrer'>
                  <FiExternalLink />
                  {t('config.url.open')}
                </a>
              </Button>
            </HStack>
            <Text fontSize='xs' color='gray.500' mt={2}>
              {widgetUrl ? t('config.url.ready') : t('config.url.disabled')}
            </Text>
          </Box>
        </VStack>
      </Flex>

      <Box
        borderWidth='1px'
        borderColor={{ base: 'gray.200', _dark: 'whiteAlpha.200' }}
        rounded='2xl'
        p={{ base: 5, md: 6 }}
      >
        <HStack gap={2} mb={4}>
          <Box color='red.500' fontSize='lg'>
            <LuMonitorPlay />
          </Box>
          <Text fontSize='md' fontWeight='semibold'>
            {t('guide.title')}
          </Text>
        </HStack>
        <VStack align='stretch' gap={3}>
          {GUIDE_STEPS.map((step, index) => (
            <HStack key={step} align='flex-start' gap={3}>
              <Center
                minW='24px'
                h='24px'
                rounded='full'
                bg={{ base: 'red.50', _dark: 'whiteAlpha.100' }}
                color='red.500'
                fontSize='xs'
                fontWeight='bold'
                flexShrink={0}
              >
                {index + 1}
              </Center>
              <Text fontSize='sm' color={{ base: 'gray.700', _dark: 'gray.300' }} lineHeight='1.6'>
                {t(`guide.steps.${step}`)}
              </Text>
            </HStack>
          ))}
        </VStack>
      </Box>
    </VStack>
  );
};
