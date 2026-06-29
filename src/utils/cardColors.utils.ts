import tinycolor from 'tinycolor2';

export const cardColors = (color: string, isDark = false): { bg: string; fg: string } => ({
  bg: isDark ? tinycolor(color).setAlpha(0.16).toRgbString() : color,
  fg: isDark ? tinycolor(color).toString() : tinycolor(color).darken(58).toString(),
});
