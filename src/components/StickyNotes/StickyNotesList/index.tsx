'use client';

import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react';
import { LuPlus } from 'react-icons/lu';
import { useTranslations } from 'next-intl';
import { StickyNote } from '@/interfaces/StickyNote.interface';
import { STICKY_NOTE_PALETTE } from '@/constants/StickyNotes';

interface StickyNotesListProps {
  notes: StickyNote[];
  resolveLabel: (note: StickyNote) => string;
  onSelect: (note: StickyNote) => void;
  onAdd: () => void;
}

export const StickyNotesList = ({ notes, resolveLabel, onSelect, onAdd }: StickyNotesListProps) => {
  const t = useTranslations('stickyNotes');

  return (
    <VStack align='stretch' gap={2} data-pw-id='sticky-notes-list'>
      {notes.map((note) => {
        const palette = STICKY_NOTE_PALETTE[note.color];

        return (
          <HStack
            key={note.id}
            as='button'
            data-pw-id={`sticky-notes-list-item-${note.id}`}
            aria-label={t('open', { label: resolveLabel(note) })}
            onClick={() => onSelect(note)}
            gap={3}
            width='100%'
            minWidth={0}
            padding={3}
            rounded='md'
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
        );
      })}

      <Button data-pw-id='sticky-notes-list-add' size='sm' width='100%' onClick={onAdd}>
        <LuPlus /> {t('add')}
      </Button>
    </VStack>
  );
};
