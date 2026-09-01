'use client';

import { useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import { Box, HStack, IconButton, Input, Textarea, VStack } from '@chakra-ui/react';
import { LuTrash2 } from 'react-icons/lu';
import { useTranslations } from 'next-intl';
import { StickyNote, StickyNoteColor } from '@/interfaces/StickyNote.interface';
import { STICKY_NOTE_COLORS, STICKY_NOTE_PALETTE } from '@/constants/StickyNotes';
import { useStickyNotes } from '@/hooks/useStickyNotes';

interface StickyNoteEditorProps {
  note: StickyNote;
  label: string;
  onDelete?: () => void;
}

export const StickyNoteEditor = ({ note, label, onDelete }: StickyNoteEditorProps) => {
  const t = useTranslations('stickyNotes');
  const { updateNote, removeNote } = useStickyNotes();
  const [draftLabel, setDraftLabel] = useState(label);
  const [draftContent, setDraftContent] = useState(note.content);
  const palette = STICKY_NOTE_PALETTE[note.color];

  const updateRef = useRef(updateNote);
  updateRef.current = updateNote;

  const commit = useRef(
    _.debounce((id: string, updates: Partial<StickyNote>) => {
      void updateRef.current(id, updates);
    }, 300)
  ).current;

  useEffect(() => {
    setDraftLabel(label);
    setDraftContent(note.content);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note.id]);

  useEffect(() => () => commit.flush(), [commit]);

  const handleDelete = async () => {
    commit.cancel();
    await removeNote(note.id);
    onDelete?.();
  };

  return (
    <VStack align='stretch' gap={3} height='100%' minHeight={0}>
      <Input
        data-pw-id='sticky-note-label-input'
        variant='flushed'
        size='sm'
        fontWeight='semibold'
        value={draftLabel}
        placeholder={t('labelPlaceholder')}
        borderColor={{ base: palette.accent, _dark: palette.accentDark }}
        _placeholder={{ color: { base: palette.text, _dark: palette.textDark }, opacity: 0.5 }}
        onChange={(event) => {
          setDraftLabel(event.target.value);
          commit(note.id, { label: event.target.value, labelKey: undefined });
        }}
        onBlur={() => commit.flush()}
      />

      <Textarea
        data-pw-id='sticky-note-content'
        flex='1'
        minHeight='120px'
        resize='none'
        variant='subtle'
        bg='transparent'
        border='none'
        paddingX='0'
        fontSize='sm'
        value={draftContent}
        placeholder={t('contentPlaceholder')}
        _placeholder={{ color: { base: palette.text, _dark: palette.textDark }, opacity: 0.5 }}
        _focusVisible={{ outline: 'none' }}
        onChange={(event) => {
          setDraftContent(event.target.value);
          commit(note.id, { content: event.target.value });
        }}
        onBlur={() => commit.flush()}
      />

      <HStack justifyContent='space-between'>
        <HStack gap={1}>
          {STICKY_NOTE_COLORS.map((color: StickyNoteColor) => (
            <Box
              key={color}
              as='button'
              aria-label={t('colorOption', { color })}
              aria-pressed={color === note.color}
              onClick={() => void updateNote(note.id, { color })}
              width='18px'
              height='18px'
              rounded='full'
              cursor='pointer'
              bg={{
                base: STICKY_NOTE_PALETTE[color].swatch,
                _dark: STICKY_NOTE_PALETTE[color].surfaceDark,
              }}
              borderWidth={color === note.color ? '2px' : '1px'}
              borderColor={
                color === note.color
                  ? { base: palette.text, _dark: palette.textDark }
                  : { base: 'rgba(0, 0, 0, 0.25)', _dark: 'rgba(255, 255, 255, 0.3)' }
              }
            />
          ))}
        </HStack>

        <IconButton
          data-pw-id='sticky-note-delete'
          aria-label={t('delete')}
          variant='ghost'
          size='xs'
          color={{ base: palette.text, _dark: palette.textDark }}
          onClick={handleDelete}
        >
          <LuTrash2 />
        </IconButton>
      </HStack>
    </VStack>
  );
};
