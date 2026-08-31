import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { StickyNote } from '@/interfaces/StickyNote.interface';

const STORAGE_KEY = 'pitmydoro_sticky_notes';

const toDocument = (note: StickyNote) => ({
  label: note.label ?? null,
  labelKey: note.labelKey ?? null,
  color: note.color,
  height: note.height,
  content: note.content,
  order: note.order,
});

const toNote = (id: string, data: Record<string, unknown>): StickyNote => ({
  id,
  label: (data.label as string) ?? undefined,
  labelKey: (data.labelKey as string) ?? undefined,
  color: data.color as StickyNote['color'],
  height: (data.height as number) ?? 46,
  content: (data.content as string) ?? '',
  order: (data.order as number) ?? 0,
  isSync: true,
});

const isWorthSyncing = (note: StickyNote) => !!note.content?.trim() || !!note.label;

export const stickyNoteService = {
  async create(note: StickyNote, userId: string) {
    await setDoc(doc(db, 'users', userId, 'notes', note.id), {
      ...toDocument(note),
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  },

  async update(userId: string, noteId: string, updates: Partial<StickyNote>) {
    const payload: Record<string, unknown> = { updatedAt: Timestamp.now() };

    if ('label' in updates) payload.label = updates.label ?? null;
    if ('labelKey' in updates) payload.labelKey = updates.labelKey ?? null;
    if (updates.color !== undefined) payload.color = updates.color;
    if (updates.height !== undefined) payload.height = updates.height;
    if (updates.content !== undefined) payload.content = updates.content;
    if (updates.order !== undefined) payload.order = updates.order;

    await updateDoc(doc(db, 'users', userId, 'notes', noteId), payload);
  },

  async delete(userId: string, noteId: string) {
    await deleteDoc(doc(db, 'users', userId, 'notes', noteId));
  },

  async getNotes(userId: string): Promise<StickyNote[]> {
    const notesQuery = query(collection(db, 'users', userId, 'notes'), orderBy('order', 'asc'));
    const snapshot = await getDocs(notesQuery);

    return snapshot.docs.map((snap) => toNote(snap.id, snap.data()));
  },

  async syncNotes(userId: string) {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const localNotes: StickyNote[] = JSON.parse(stored)?.state?.notes ?? [];
    const pendingNotes = localNotes.filter((note) => !note.isSync && isWorthSyncing(note));

    for (const note of pendingNotes) {
      await this.create(note, userId);
    }
  },
};
