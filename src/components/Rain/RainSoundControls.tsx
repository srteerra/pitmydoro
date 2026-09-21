'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Box, createListCollection, HStack, IconButton, Presence, Slider, VStack, } from '@chakra-ui/react';
import { LuVolume2, LuVolumeX } from 'react-icons/lu';
import { MdOutlineGrain } from 'react-icons/md';
import { useTranslations } from 'next-intl';
import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@/components/ui/select';
import { Tooltip } from '@/components/ui/tooltip';
import { RAIN_TRACKS, RainIntensity, RainTrack } from '@/constants/Rain';
import { applyRainVolume } from '@/hooks/useRainSound';
import { useDebounce } from '@/hooks/useDebounce';
import { useSettings } from '@/hooks/useSettings';
import useSettingsStore from '@/stores/Settings.store';

const VOLUME_COMMIT_DELAY_MS = 800;

const TRACK_COMMIT_DELAY_MS = 400;

const TOGGLE_COMMIT_DELAY_MS = 400;

interface Props {
  intensity: RainIntensity | null;
}

export const RainSoundControls = ({ intensity }: Props) => {
  const t = useTranslations('pomodoro');
  const { handleRainSoundEnabled, handleRainVolumeChange, handleRainTrackChange } = useSettings();
  const enabled = useSettingsStore((state) => state.rainSoundEnabled);
  const volume = useSettingsStore((state) => state.rainVolume);
  const track = useSettingsStore((state) => state.rainTrack);
  const setEnabled = useSettingsStore((state) => state.setRainSoundEnabled);
  const [draft, setDraft] = useState(volume);
  const [trackDraft, setTrackDraft] = useState(track);
  const [shown, setShown] = useState(intensity);

  const commitVolume = useDebounce(handleRainVolumeChange, VOLUME_COMMIT_DELAY_MS);
  const commitTrack = useDebounce(handleRainTrackChange, TRACK_COMMIT_DELAY_MS);
  const commitEnabled = useDebounce(handleRainSoundEnabled, TOGGLE_COMMIT_DELAY_MS);

  useEffect(() => {
    if (intensity) setShown(intensity);
  }, [intensity]);

  useEffect(() => setDraft(volume), [volume]);

  useEffect(() => setTrackDraft(track), [track]);

  const label = enabled ? t('rainSoundMute') : t('rainSoundUnmute');

  const tracks = useMemo(
    () =>
      createListCollection({
        items: RAIN_TRACKS.map((option, index) => ({
          value: option,
          label: `${t('rainTrackLabel')} ${index + 1}`,
        })),
      }),
    [t]
  );

  const showTrack = shown === 'wet';

  const handleVolumeChange = (next: number) => {
    setDraft(next);
    if (enabled) applyRainVolume(next);
    commitVolume(next);
  };

  const handleTrackChange = (next: RainTrack) => {
    setTrackDraft(next);
    commitTrack(next);
  };

  const handleToggle = () => {
    const next = !enabled;
    setEnabled(next);
    commitEnabled(next);
  };

  return (
    <Presence
      present={!!intensity}
      lazyMount
      unmountOnExit
      animationName={{ _open: 'fade-in, slide-from-bottom', _closed: 'fade-out, slide-to-bottom' }}
      animationDuration='slow'
      animationTimingFunction='ease-out'
      css={{
        '--slide-from-bottom-distance': '18px',
        '--slide-to-bottom-distance': '18px',
      }}
      data-pw-id='rain-sound-dock'
      position='fixed'
      height='0'
      width='100vw'
      bottom={{
        base: 'calc(1rem + var(--cookie-consent-offset, 0px))',
        md: 'calc(1.5rem + var(--cookie-consent-offset, 0px))',
      }}
      left={{ base: 4, md: 1 }}
      zIndex={1000}
      pointerEvents='none'
    >
      <VStack
        data-pw-id='rain-sound-controls'
        position='absolute'
        bottom='0'
        left={{ base: 3, md: 5 }}
        width={{ base: 'calc(100vw - 55px)', md: '184px' }}
        pointerEvents='auto'
        align='stretch'
        gap={0}
        padding={1.5}
        rounded='2xl'
        borderWidth='1px'
        borderColor={{ base: 'blackAlpha.200', _dark: 'whiteAlpha.200' }}
        bg={{ base: 'white', _dark: 'dark.200' }}
        boxShadow='sm'
      >
        <Box
          width='full'
          display='grid'
          gridTemplateRows={showTrack ? '1fr' : '0fr'}
          opacity={showTrack ? 1 : 0}
          visibility={showTrack ? 'visible' : 'hidden'}
          pointerEvents={showTrack ? 'auto' : 'none'}
          aria-hidden={!showTrack}
          transition={
            showTrack
              ? 'grid-template-rows 240ms ease-out, opacity 200ms ease-out, visibility 0s'
              : 'grid-template-rows 240ms ease-out, opacity 160ms ease-out, visibility 0s linear 240ms'
          }
        >
          <Box minHeight='0' overflow='hidden'>
            <HStack gap={0} paddingX={2} paddingBottom={1.5}>
              <MdOutlineGrain size={20} />

              <SelectRoot
                data-pw-id='rain-sound-track'
                size='sm'
                collection={tracks}
                value={[trackDraft]}
                variant={'ghost'}
                onValueChange={({ value }) => handleTrackChange(value[0] as RainTrack)}
              >
                <SelectLabel srOnly>{t('rainSoundTrack')}</SelectLabel>

                <SelectTrigger data-pw-id='rain-sound-track-trigger'>
                  <SelectValueText paddingX='5px' placeholder={t('rainSoundTrack')} />
                </SelectTrigger>

                <SelectContent borderRadius='md'>
                  {tracks.items.map((item) => (
                    <SelectItem cursor={{ _hover: 'pointer' }} item={item} key={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </HStack>
          </Box>
        </Box>

        <HStack gap={1.5} paddingRight={1}>
          <Tooltip content={label} openDelay={200} closeDelay={100}>
            <IconButton
              data-pw-id='rain-sound-toggle'
              aria-label={label}
              onClick={handleToggle}
              variant='ghost'
              rounded='full'
              size='sm'
              color={{ base: 'gray.600', _dark: 'gray.300' }}
            >
              {enabled ? <LuVolume2 /> : <LuVolumeX />}
            </IconButton>
          </Tooltip>

          <Slider.Root
            data-pw-id='rain-sound-volume'
            flex='1'
            size='sm'
            min={0}
            max={1}
            step={0.01}
            value={[enabled ? draft : 0]}
            disabled={!enabled}
            onValueChange={({ value }) => handleVolumeChange(value[0])}
          >
            <Slider.Label srOnly>{t('rainSoundVolume')}</Slider.Label>
            <Slider.Control>
              <Slider.Track>
                <Slider.Range />
              </Slider.Track>
              <Slider.Thumb index={0} boxShadow='none' borderWidth='1px'>
                <Slider.HiddenInput />
              </Slider.Thumb>
            </Slider.Control>
          </Slider.Root>
        </HStack>
      </VStack>
    </Presence>
  );
};
