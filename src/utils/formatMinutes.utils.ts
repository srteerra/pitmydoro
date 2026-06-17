export const formatMinutes = (minutes: number): string => {
  const totalSeconds = Math.round(minutes * 60);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  if (h > 0) return `${h}hr ${m}mins`;
  if (m > 0) return `${m}mins`;
  return `${s}secs`;
};
