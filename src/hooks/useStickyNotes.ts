import { useEffect } from 'react';
import _ from 'lodash';
import { StickyNote } from '@/interfaces/StickyNote.interface';
import { createStickyNote, useStickyNotesStore } from '@/stores/StickyNotes.store';
import { stickyNoteService } from '@/services/stickyNote.service';
import { useAuth } from '@/contexts/AuthContext';

const pendingUpdates = new Map<string, Partial<StickyNote>>();

const flushUpdates = _.debounce((userId: string) => {
  const entries = [...pendingUpdates.entries()];
  pendingUpdates.clear();

  entries.forEach(([noteId, updates]) => void stickyNoteService.update(userId, noteId, updates));
}, 800);

const queueUpdate = (userId: string, noteId: string, updates: Partial<StickyNote>) => {
  pendingUpdates.set(noteId, { ...(pendingUpdates.get(noteId) ?? {}), ...updates });
  flushUpdates(userId);
};

export function useStickyNotes() {
  const { user } = useAuth();
  const setNotes = useStickyNotesStore((state) => state.setNotes);
  const addNoteToStore = useStickyNotesStore((state) => state.addNote);
  const updateNoteInStore = useStickyNotesStore((state) => state.updateNote);
  const removeNoteFromStore = useStickyNotesStore((state) => state.removeNote);
  const toggleNote = useStickyNotesStore((state) => state.toggleNote);
  const openNote = useStickyNotesStore((state) => state.openNote);
  const closeNote = useStickyNotesStore((state) => state.closeNote);
  const closeAll = useStickyNotesStore((state) => state.closeAll);

  useEffect(() => {
    const handleUnload = () => flushUpdates.flush();
    window.addEventListener('beforeunload', handleUnload);

    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  const addNote = async () => {
    const note = createStickyNote(useStickyNotesStore.getState().notes, !!user);
    addNoteToStore(note);

    if (user) await stickyNoteService.create(note, user.uid);

    return note;
  };

  const updateNote = async (id: string, updates: Partial<StickyNote>) => {
    updateNoteInStore(id, updates);

    if (!user) return;

    const note = useStickyNotesStore.getState().notes.find((item) => item.id === id);
    if (!note) return;

    if (!note.isSync) {
      updateNoteInStore(id, { isSync: true });
      await stickyNoteService.create({ ...note, isSync: true }, user.uid);

      return;
    }

    queueUpdate(user.uid, id, updates);
  };

  const removeNote = async (id: string) => {
    const note = useStickyNotesStore.getState().notes.find((item) => item.id === id);
    removeNoteFromStore(id);

    if (user && note?.isSync) await stickyNoteService.delete(user.uid, id);
  };

  const loadNotes = async (userId: string) => {
    await stickyNoteService.syncNotes(userId);
    const remoteNotes = await stickyNoteService.getNotes(userId);

    if (!remoteNotes.length) return;

    const localOnly = useStickyNotesStore
      .getState()
      .notes.filter((note) => !note.isSync && !remoteNotes.some((remote) => remote.id === note.id));

    setNotes([...remoteNotes, ...localOnly].map((note, index) => ({ ...note, order: index })));
  };

  const wipeNotes = async () => {
    flushUpdates.cancel();
    pendingUpdates.clear();

    const localNotes = useStickyNotesStore.getState().notes.filter((note) => !note.isSync);

    setNotes(localNotes);
    closeAll();
  };

  return {
    addNote,
    updateNote,
    removeNote,
    toggleNote,
    openNote,
    closeNote,
    loadNotes,
    wipeNotes,
  };
}
