'use client';

import { useMemo } from 'react';
import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react';
import { LuPlus } from 'react-icons/lu';
import { useTranslations } from 'next-intl';
import { StickyNote } from '@/interfaces/StickyNote.interface';
import { STICKY_NOTE_PALETTE } from '@/constants/StickyNotes';
import { ProjectIndicator } from '@/components/Projects/ProjectIndicator';
import { PinButton } from '@/components/PinButton';
import { useStickyNotesStore } from '@/stores/StickyNotes.store';

interface StickyNotesListProps {
  notes: StickyNote[];
  resolveLabel: (note: StickyNote) => string;
  onSelect: (note: StickyNote) => void;
  onAdd: () => void;
  onTogglePin: (note: StickyNote) => void;
}

interface NoteRowProps extends Omit<StickyNotesListProps, 'notes' | 'onAdd'> {
  note: StickyNote;
}

const NoteRow = ({ note, resolveLabel, onSelect, onTogglePin }: NoteRowProps) => {
  const t = useTranslations('stickyNotes');
  const palette = STICKY_NOTE_PALETTE[note.color];

  return (
    <HStack
      className='group'
      position='relative'
      gap={1}
      paddingRight={3}
      rounded='md'
      width='100%'
      minWidth={0}
    >
      <HStack
        as='button'
        data-pw-id={`sticky-notes-list-item-${note.id}`}
        aria-label={t('open', { label: resolveLabel(note) })}
        onClick={() => onSelect(note)}
        gap={3}
        flex='1'
        minWidth={0}
        padding={3}
        cursor='pointer'
        textAlign='left'
      >
        <Box
          width='14px'
          height='14px'
          rounded='sm'
          flexShrink={0}
          bg={{ base: palette.surface, _dark: palette.surfaceDark }}
          borderWidth='1px'
          borderColor={{ base: palette.accent, _dark: palette.accentDark }}
        />

        <VStack align='stretch' gap={0} minWidth={0} flex='1'>
          <Text fontSize='sm' fontWeight='semibold' truncate>
            {resolveLabel(note)}
          </Text>
          <Text fontSize='xs' opacity={0.6} truncate>
            {note.content.trim() || t('emptyNote')}
          </Text>
        </VStack>
      </HStack>

      <PinButton
        pinned={!!note.pinned}
        label={note.pinned ? t('unpin') : t('pin')}
        testId={`sticky-notes-list-pin-${note.id}`}
        onToggle={() => onTogglePin(note)}
      />

      <ProjectIndicator projectId={note.projectId} />
    </HStack>
  );
};

export const StickyNotesList = ({ notes, onAdd, ...rowProps }: StickyNotesListProps) => {
  const t = useTranslations('stickyNotes');
  const storedNotes = useStickyNotesStore((state) => state.notes);

  const liveNotes = useMemo(
    () => notes.map((note) => storedNotes.find((stored) => stored.id === note.id) ?? note),
    [notes, storedNotes]
  );

  return (
    <VStack align='stretch' gap={2} data-pw-id='sticky-notes-list'>
      {liveNotes.map((note) => (
        <NoteRow key={note.id} note={note} {...rowProps} />
      ))}

      <Button data-pw-id='sticky-notes-list-add' size='sm' width='100%' onClick={onAdd}>
        <LuPlus /> {t('add')}
      </Button>
    </VStack>
  );
};
