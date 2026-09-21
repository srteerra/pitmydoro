export type RainIntensity = 'wet' | 'intermediate';

export type RainTrack = 'rain-1' | 'rain-2' | 'rain-3';

export const RAIN_TRACKS: RainTrack[] = ['rain-1', 'rain-2', 'rain-3'];

export const DEFAULT_RAIN_TRACK: RainTrack = RAIN_TRACKS[0];

const INTERMEDIATE_SOURCE = 'sounds/rain-int.mp3';

export const rainTrackSource = (intensity: RainIntensity, track: RainTrack) => {
  if (intensity === 'intermediate') return INTERMEDIATE_SOURCE;

  return `sounds/${RAIN_TRACKS.includes(track) ? track : DEFAULT_RAIN_TRACK}.mp3`;
};

export interface RainLook {
  amount: number;
  speed: number;
  wind: number;
  dropLength: number;
  vignette: boolean;
  opacity: { light: number; dark: number };
}

export const RAIN_LOOKS: Record<RainIntensity, RainLook> = {
  wet: {
    amount: 180,
    speed: 880,
    wind: 150,
    dropLength: 20,
    vignette: true,
    opacity: { light: 0.75, dark: 0.45 },
  },
  intermediate: {
    amount: 70,
    speed: 680,
    wind: 90,
    dropLength: 13,
    vignette: false,
    opacity: { light: 0.55, dark: 0.32 },
  },
};
