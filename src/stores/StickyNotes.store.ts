import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { StickyNote } from '@/interfaces/StickyNote.interface';
import { STICKY_NOTE_TAB_HEIGHT } from '@/constants/StickyNotes';

interface StickyNotesStore {
  notes: StickyNote[];
  openIds: string[];

  setNotes: (notes: StickyNote[]) => void;
  addNote: (note: StickyNote) => void;
  updateNote: (id: string, updates: Partial<StickyNote>) => void;
  removeNote: (id: string) => void;
  reorderNotes: (ids: string[]) => void;

  openNote: (id: string) => void;
  closeNote: (id: string) => void;
  toggleNote: (id: string) => void;
  closeAll: () => void;
  resetAll: () => void;
}

const LEGACY_DEFAULT_IDS = ['sticky-note-notes', 'sticky-note-ideas', 'sticky-note-project'];

const dropLegacyDefaults = (notes: StickyNote[]) =>
  notes
    .filter((note) => !LEGACY_DEFAULT_IDS.includes(note.id) || !!note.content.trim())
    .map((note) =>
      LEGACY_DEFAULT_IDS.includes(note.id) ? { ...note, labelKey: 'defaults.new' } : note
    );

export const createStickyNote = (notes: StickyNote[], isSync = false): StickyNote => ({
  id: `sticky-note-${crypto.randomUUID()}`,
  labelKey: 'defaults.new',
  color: 'yellow',
  height: STICKY_NOTE_TAB_HEIGHT,
  content: '',
  order: notes.length,
  isSync,
});

export const useStickyNotesStore = create<StickyNotesStore>()(
  persist(
    (set) => ({
      notes: [],
      openIds: [],

      setNotes: (notes) => set({ notes }),

      addNote: (note) =>
        set((state) => ({ notes: [...state.notes, note], openIds: [...state.openIds, note.id] })),

      updateNote: (id, updates) =>
        set((state) => ({
          notes: state.notes.map((note) => (note.id === id ? { ...note, ...updates } : note)),
        })),

      removeNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
          openIds: state.openIds.filter((openId) => openId !== id),
        })),

      reorderNotes: (ids) =>
        set((state) => ({
          notes: state.notes.map((note) => {
            const order = ids.indexOf(note.id);

            return order === -1 ? note : { ...note, order };
          }),
        })),

      openNote: (id) =>
        set((state) => ({
          openIds: state.openIds.includes(id) ? state.openIds : [...state.openIds, id],
        })),

      closeNote: (id) =>
        set((state) => ({ openIds: state.openIds.filter((openId) => openId !== id) })),

      toggleNote: (id) =>
        set((state) => ({
          openIds: state.openIds.includes(id)
            ? state.openIds.filter((openId) => openId !== id)
            : [...state.openIds, id],
        })),

      closeAll: () => set({ openIds: [] }),

      resetAll: () => set({ notes: [], openIds: [] }),
    }),
    {
      name: 'pitmydoro_sticky_notes',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ notes: state.notes, openIds: state.openIds }),
      version: 1,
      migrate: (persistedState, version) => {
        const state = persistedState as Partial<StickyNotesStore>;

        if (version >= 1) return state as StickyNotesStore;

        const notes = dropLegacyDefaults(state.notes ?? []);
        const ids = notes.map((note) => note.id);

        return {
          ...state,
          notes,
          openIds: (state.openIds ?? []).filter((openId) => ids.includes(openId)),
        } as StickyNotesStore;
      },
    }
  )
);
