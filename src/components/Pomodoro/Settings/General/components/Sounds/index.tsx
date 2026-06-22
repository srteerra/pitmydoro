import { VStack } from '@chakra-ui/react';
import React from 'react';
import { SwitchInput } from '@/components/Form/SwitchInput';
import { SliderInput } from '@/components/Form/SliderInput';
import { useTranslations } from 'use-intl';
import { useSettings } from '@/hooks/useSettings';
import { useDebounce } from '@/hooks/useDebounce';
import useSettingsStore from '@/stores/Settings.store';

export const Sounds = () => {
  const { handleSwitchSounds, handleVolumeChange } = useSettings();
  const enableSounds = useSettingsStore((state) => state.enableSounds);
  const volume = useSettingsStore((state) => state.volume);
  const setVolume = useSettingsStore((state) => state.setVolume);
  const t = useTranslations('settings.sections.sounds');

  const debouncedSaveVolume = useDebounce(handleVolumeChange, 1500);

  const onVolumeChange = (value: number) => {
    setVolume(value);
    debouncedSaveVolume(value);
  };

  return (
    <VStack gap={8} marginY={'20px'} width={'100%'}>
      <SwitchInput
        title={t('enableSound.title')}
        description={t('enableSound.description')}
        value={enableSounds}
        defaultValue={false}
        onChange={(value: boolean) => handleSwitchSounds(value)}
      />
      <SliderInput
        title={t('volume.title')}
        description={t('volume.description')}
        value={volume}
        onChange={onVolumeChange}
        disabled={!enableSounds}
      />
    </VStack>
  );
};
