export type StickyNoteColor = 'yellow' | 'pink' | 'green' | 'blue' | 'purple' | 'orange';

export interface StickyNote {
  id: string;
  label?: string;
  labelKey?: string;
  color: StickyNoteColor;
  height: number;
  content: string;
  order: number;
  isSync?: boolean;
}

export interface StickyNotePalette {
  surface: string;
  surfaceDark: string;
  text: string;
  textDark: string;
  accent: string;
  accentDark: string;
  swatch: string;
}
