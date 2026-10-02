import tinycolor from 'tinycolor2';
import { useTheme } from 'next-themes';
import useSessionStore from '@/stores/Session.store';
import useSettingsStore from '@/stores/Settings.store';

export interface StartButtonColors {
  buttonColor: string;
  spanColor: string;
  textColor: string;
}

export function useStartButtonColors(): StartButtonColors {
  const { theme } = useTheme();
  const status = useSessionStore((state) => state.status);
  const colors = useSettingsStore((state) => state.currentScuderia?.colors);
  const isDark = theme === 'dark';
  const background = colors?.background?.[status];

  const buttonColor = tinycolor(isDark ? colors?.primary?.dark : background)
    .darken(isDark ? 15 : 10)
    .brighten(isDark ? 0 : -15)
    .toString();

  const spanColor = tinycolor(isDark ? colors?.primary?.default : background)
    .darken(10)
    .brighten(isDark ? 0 : -5)
    .toString();

  return { buttonColor, spanColor, textColor: isDark ? 'dark.200' : 'light' };
}
