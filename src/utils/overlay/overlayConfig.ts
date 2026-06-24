import { OverlayConfig } from '@/interfaces/Overlay.interface';

export const DEFAULT_OVERLAY_CONFIG: OverlayConfig = {
  showSprite: true,
  showTimer: true,
  showTask: true,
  showFlag: true,
  spriteScale: 3,
  timerScale: 1,
  taskScale: 1,
  align: 'center',
  timerColor: 'auto',
  fontStyle: 'neutral',
  locale: 'en',
};

export const buildWidgetUrl = (token: string): string => {
  const path = `/stream-overlay/widget?token=${encodeURIComponent(token)}`;
  if (typeof window === 'undefined') return path;
  return `${window.location.origin}${path}`;
};
