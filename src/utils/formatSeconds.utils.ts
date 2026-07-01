import { statSeconds } from '@/utils/statSeconds.utils';

type FormatSeconds = 'duration' | 'clock';

export const formatSeconds = (
  value: number | null | undefined,
  format: FormatSeconds = 'duration'
): string => {
  const seconds = statSeconds(value);
  if (seconds === null) return '-/-';

  const total = Math.max(0, seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  if (format === 'clock') {
    const mm = m.toString().padStart(2, '0');
    const ss = s.toString().padStart(2, '0');
    return h > 0 ? `${h.toString().padStart(2, '0')}:${mm}:${ss}` : `${mm}:${ss}`;
  }

  const parts: string[] = [];
  if (h > 0) parts.push(`${h}hr${h === 1 ? '' : 's'}`);
  if (m > 0) parts.push(`${m}min${m === 1 ? '' : 's'}`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);
  return parts.join(' ');
};
