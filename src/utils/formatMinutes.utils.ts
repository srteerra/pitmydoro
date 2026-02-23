export const formatMinutes = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);

  if (h > 0) return `${h}hr ${m}mins`;
  return `${m}mins`;
};
