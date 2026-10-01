import { StickyNotePalette } from '@/interfaces/StickyNote.interface';

export type TabSection = 'projects' | 'stickyNotes';

export const DEFAULT_TAB_COLORS: Record<TabSection, StickyNotePalette> = {
  projects: {
    surface: '#FFFFFF',
    surfaceDark: '#3A3A40',
    text: '#27272A',
    textDark: '#F4F4F5',
    accent: '#A1A1AA',
    accentDark: '#71717A',
    swatch: '#FFFFFF',
  },
  stickyNotes: {
    surface: '#FFFFFF',
    surfaceDark: '#3A3A40',
    text: '#27272A',
    textDark: '#F4F4F5',
    accent: '#A1A1AA',
    accentDark: '#71717A',
    swatch: '#FFFFFF',
  },
};

export const DEFAULT_TAB_TINT_AMOUNT = 30;
export const DIMMED_TAB_OPACITY = 0.5;
export const DIMMED_TAB_TRANSITION = 'opacity 0.2s ease';
export const ACTIVE_GENERAL_TAB_TEXT_COLOR = '#FFFFFF';
