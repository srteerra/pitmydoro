import { StickyNoteColor, StickyNotePalette } from '@/interfaces/StickyNote.interface';

export const PROJECTS_STORAGE_KEY = 'pitmydoro_projects';
export const PROJECT_DEFAULT_COLOR: StickyNoteColor = 'blue';
export const PROJECT_INDICATOR_SIZE = '8px';
export const PROJECT_INDICATOR_THICKNESS = '5px';
export const PROJECT_INDICATOR_HEIGHT = '12px';

export const PROJECT_TAB_WIDTH = 90;
export const PROJECT_TAB_PEEK = 46;
export const PROJECT_TAB_REVEAL = 58;
export const PROJECT_TAB_HEIGHT = 124;
export const PROJECT_TAB_SQUARE_HEIGHT = 46;
export const PROJECT_SQUARE_TABS = 3;

export const PROJECTS_LIST_ACTION_OPACITY = 0.6;

export const PROJECTS_LIST_COLORS = {
  drawer: { base: 'gray.100', _dark: 'gray.950' },
  card: { base: 'white', _dark: 'gray.800' },
};

export const PROJECT_PALETTE: Record<StickyNoteColor, StickyNotePalette> = {
  yellow: {
    surface: '#D9CB8F',
    surfaceDark: '#6B6135',
    text: '#3B3520',
    textDark: '#F7F0D4',
    accent: '#B8A55C',
    accentDark: '#A8994F',
    swatch: '#D9CB8F',
  },
  pink: {
    surface: '#D9AEB7',
    surfaceDark: '#6E434C',
    text: '#3F2A2E',
    textDark: '#F8E4E8',
    accent: '#BE8592',
    accentDark: '#B0707E',
    swatch: '#D9AEB7',
  },
  green: {
    surface: '#AFC6A6',
    surfaceDark: '#46603C',
    text: '#26331F',
    textDark: '#E6F2E0',
    accent: '#86A37A',
    accentDark: '#7A9A6C',
    swatch: '#AFC6A6',
  },
  blue: {
    surface: '#A9BFD1',
    surfaceDark: '#3C566B',
    text: '#1F2D38',
    textDark: '#E0ECF6',
    accent: '#7F9CB5',
    accentDark: '#6F90AD',
    swatch: '#A9BFD1',
  },
  purple: {
    surface: '#BCB0D1',
    surfaceDark: '#54476E',
    text: '#2C2540',
    textDark: '#ECE6F7',
    accent: '#9687B5',
    accentDark: '#8B7BB0',
    swatch: '#BCB0D1',
  },
  orange: {
    surface: '#DDB891',
    surfaceDark: '#6E5033',
    text: '#3E2C1A',
    textDark: '#F8EADB',
    accent: '#C4935F',
    accentDark: '#B8864F',
    swatch: '#DDB891',
  },
};

export const PROJECT_PICKER_NONE_VALUE = 'none';
export const PROJECT_PICKER_DOT_SIZE = '10px';
export const PROJECT_PICKER_BORDER_COLOR = { base: 'blackAlpha.100', _dark: 'whiteAlpha.100' };
export const PROJECT_PICKER_HOVER_BORDER_COLOR = {
  base: 'blackAlpha.200',
  _dark: 'whiteAlpha.200',
};
