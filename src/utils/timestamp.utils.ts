const toMillis = (timestamp: unknown): number => {
  if (!timestamp) return 0;

  if (typeof timestamp === 'number') return timestamp;

  if (typeof timestamp === 'object') {
    const ts = timestamp as { toMillis?: () => number; seconds?: number; nanoseconds?: number };

    if (typeof ts.toMillis === 'function') return ts.toMillis();

    if (ts.seconds !== undefined) {
      return ts.seconds * 1000 + (ts.nanoseconds ?? 0) / 1_000_000;
    }
  }

  return 0;
};

const formatDate = (timestamp: unknown): string => {
  const ms = toMillis(timestamp);
  return ms ? new Date(ms).toLocaleString() : '—';
};

export const timestampUtils = {
  toMillis,
  formatDate,
};
