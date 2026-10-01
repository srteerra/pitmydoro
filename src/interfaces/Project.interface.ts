import { StickyNoteColor } from '@/interfaces/StickyNote.interface';

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: StickyNoteColor;
  order: number;
  isSync?: boolean;
  pinned?: boolean;
}

export interface ProjectLinked {
  projectId?: string | null;
}
