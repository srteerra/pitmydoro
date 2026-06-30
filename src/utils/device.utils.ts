export const isDesktopDevice = (): boolean =>
  typeof navigator !== 'undefined' &&
  !/Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
