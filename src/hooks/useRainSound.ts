import { useEffect, useRef } from 'react';
import useSettingsStore from '@/stores/Settings.store';
import { RainIntensity, rainTrackSource } from '@/constants/Rain';

const FADE_MS = 600;

const clamp = (value: number) => Math.min(1, Math.max(0, value));

let liveAudio: HTMLAudioElement | null = null;
let fadeFrame = 0;

const stopFade = () => {
  if (!fadeFrame) return;

  window.cancelAnimationFrame(fadeFrame);
  fadeFrame = 0;
};

export const applyRainVolume = (volume: number) => {
  if (!liveAudio) return;

  stopFade();
  liveAudio.volume = clamp(volume);
};

export const useRainSound = (intensity: RainIntensity | null) => {
  const enabled = useSettingsStore((state) => state.rainSoundEnabled);
  const volume = useSettingsStore((state) => state.rainVolume);
  const track = useSettingsStore((state) => state.rainTrack);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastRef = useRef<{ audio: HTMLAudioElement | null; enabled: boolean }>({
    audio: null,
    enabled,
  });

  useEffect(() => {
    if (!intensity) return;

    const source = rainTrackSource(intensity, track);
    const audio = new Audio(source);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0;
    audio.setAttribute('data-pw-id', 'rain-audio');
    audio.setAttribute('data-pw-track', source);
    document.body.appendChild(audio);

    audioRef.current = audio;
    liveAudio = audio;

    const retry = () => {
      if (audioRef.current === audio) void audio.play().catch(() => undefined);
    };

    void audio.play().catch(() => {
      document.addEventListener('pointerdown', retry, { once: true });
      document.addEventListener('keydown', retry, { once: true });
    });

    return () => {
      audioRef.current = null;
      if (liveAudio === audio) liveAudio = null;
      stopFade();
      document.removeEventListener('pointerdown', retry);
      document.removeEventListener('keydown', retry);
      audio.pause();
      audio.remove();
      audio.removeAttribute('src');
      audio.load();
    };
  }, [intensity, track]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const swapped = lastRef.current.audio !== audio;
    const toggled = lastRef.current.enabled !== enabled;

    lastRef.current = { audio, enabled };

    if (!swapped && !toggled) {
      if (enabled) applyRainVolume(volume);
      return;
    }

    const target = enabled ? clamp(volume) : 0;
    const from = audio.volume;
    const startedAt = performance.now();

    stopFade();

    if (enabled && audio.paused) void audio.play().catch(() => undefined);

    const step = () => {
      const progress = Math.min(1, (performance.now() - startedAt) / FADE_MS);
      audio.volume = clamp(from + (target - from) * progress);

      if (progress < 1) {
        fadeFrame = window.requestAnimationFrame(step);
        return;
      }

      fadeFrame = 0;
      if (!enabled) audio.pause();
    };

    step();
  }, [intensity, enabled, track, volume]);
};
