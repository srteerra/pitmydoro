import { useMemo } from 'react';
import tinycolor from 'tinycolor2';
import { StickyNotePalette } from '@/interfaces/StickyNote.interface';
import { DEFAULT_TAB_COLORS, DEFAULT_TAB_TINT_AMOUNT, TabSection } from '@/constants/TabColors';
import useSessionStore from '@/stores/Session.store';
import useSettingsStore from '@/stores/Settings.store';

export function useNeutralTabPalette(section: TabSection): StickyNotePalette {
  const status = useSessionStore((state) => state.status);
  const baseColor = useSettingsStore(
    (state) => state.currentScuderia?.colors?.background?.[status]
  );

  return useMemo(() => {
    const defaultPalette = DEFAULT_TAB_COLORS[section];

    if (!baseColor || !tinycolor(baseColor).isValid()) return defaultPalette;

    const tint = tinycolor
      .mix(defaultPalette.surface, baseColor, DEFAULT_TAB_TINT_AMOUNT)
      .toHexString();

    return { ...defaultPalette, surface: tint, swatch: tint, accent: baseColor };
  }, [baseColor, section]);
}
