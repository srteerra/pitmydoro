export const formatMinutes = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);

  const mm = m.toString().padStart(2, '0');

  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${mm}`;
  }

  return `00:${mm}`;
};
