type FormatMs = 'clock' | 'human';

export const formatMs = (ms: number, format: FormatMs = 'clock'): string => {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);

  if (format === 'human') {
    if (h > 0) return `${h}hr ${m}mins`;
    if (m > 0) return `${m}mins`;
    return `${s}secs`;
  }

  const mm = m.toString().padStart(2, '0');
  const ss = s.toString().padStart(2, '0');

  if (h > 0) return `${h.toString().padStart(2, '0')}:${mm}:${ss}`;
  return `${mm}:${ss}`;
};
