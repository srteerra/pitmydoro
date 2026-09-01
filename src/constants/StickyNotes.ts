import { StickyNoteColor, StickyNotePalette } from '@/interfaces/StickyNote.interface';

export const STICKY_NOTE_COLORS: StickyNoteColor[] = [
  'yellow',
  'pink',
  'green',
  'blue',
  'purple',
  'orange',
];

export const STICKY_NOTE_PALETTE: Record<StickyNoteColor, StickyNotePalette> = {
  yellow: {
    surface: '#FBF8EA',
    surfaceDark: '#33301F',
    text: '#4A452F',
    textDark: '#F2EBCF',
    accent: '#E3D9B4',
    accentDark: '#5C563A',
    swatch: '#F0E9CE',
  },
  pink: {
    surface: '#FAF1F3',
    surfaceDark: '#35272A',
    text: '#4A3A3C',
    textDark: '#F5E2E6',
    accent: '#E0C9CE',
    accentDark: '#5E464B',
    swatch: '#EEDDE0',
  },
  green: {
    surface: '#F1F6EF',
    surfaceDark: '#26301F',
    text: '#37402F',
    textDark: '#E2EEDD',
    accent: '#C7D6C2',
    accentDark: '#46563B',
    swatch: '#DDE7DA',
  },
  blue: {
    surface: '#F1F5F9',
    surfaceDark: '#1F2C36',
    text: '#323E47',
    textDark: '#DDEAF4',
    accent: '#C3D2DE',
    accentDark: '#3A4E5E',
    swatch: '#DAE4EC',
  },
  purple: {
    surface: '#F4F1F7',
    surfaceDark: '#2B2637',
    text: '#3B3546',
    textDark: '#E7E1F2',
    accent: '#CEC7DC',
    accentDark: '#4B4361',
    swatch: '#E2DDEB',
  },
  orange: {
    surface: '#FBF3EA',
    surfaceDark: '#362B1F',
    text: '#4A3C2E',
    textDark: '#F4E6D6',
    accent: '#E0CDB6',
    accentDark: '#5E4B37',
    swatch: '#EFE1D0',
  },
};

export const STICKY_NOTE_TAB_WIDTH = 210;
export const STICKY_NOTE_TAB_PEEK = 46;
export const STICKY_NOTE_TAB_REVEAL = 122;
export const STICKY_NOTE_TAB_HEIGHT = 46;
export const STICKY_NOTE_STACK_GAP = 10;
export const STICKY_NOTE_STACK_TOP = 28;

export const STICKY_NOTE_PANEL_SIZE = { width: 320, height: 340 };
export const STICKY_NOTE_PANEL_MIN_SIZE = { width: 240, height: 200 };
export const STICKY_NOTE_PANEL_CASCADE = 26;
export const STICKY_NOTE_PANEL_EDGE = 16;
