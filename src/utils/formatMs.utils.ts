export const formatMs = (ms: number): string => {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);

  const mm = m.toString().padStart(2, '0');
  const ss = s.toString().padStart(2, '0');

  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${mm}:${ss}`;
  }

  return `${mm}:${ss}`;
};
