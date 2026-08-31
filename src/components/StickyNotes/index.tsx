'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, IconButton, useMediaQuery, VStack } from '@chakra-ui/react';
import { LuPlus, LuStickyNote } from 'react-icons/lu';
import { useTranslations } from 'next-intl';
import { StickyNote } from '@/interfaces/StickyNote.interface';
import { useStickyNotes } from '@/hooks/useStickyNotes';
import { useStickyNotesStore } from '@/stores/StickyNotes.store';
import { useDrawer } from '@/contexts/DrawerContext';
import { StickyNoteTab } from '@/components/StickyNotes/StickyNoteTab';
import { StickyNotePanel } from '@/components/StickyNotes/StickyNotePanel';
import { StickyNotesList } from '@/components/StickyNotes/StickyNotesList';
import { StickyNoteEditor } from '@/components/StickyNotes/StickyNoteEditor';
import { Tooltip } from '@/components/ui/tooltip';
import {
  STICKY_NOTE_PANEL_SIZE,
  STICKY_NOTE_STACK_GAP,
  STICKY_NOTE_STACK_TOP,
  STICKY_NOTE_TAB_HEIGHT,
} from '@/constants/StickyNotes';

export const StickyNotes = () => {
  const t = useTranslations('stickyNotes');
  const { toggleNote, openNote, addNote } = useStickyNotes();
  const notes = useStickyNotesStore((state) => state.notes);
  const openIds = useStickyNotesStore((state) => state.openIds);
  const { openDrawer, closeDrawer } = useDrawer();
  const [isDesktop] = useMediaQuery(['(min-width: 64em)'], { fallback: [false] });
  const [mounted, setMounted] = useState(false);
  const [cardHeight, setCardHeight] = useState(0);
  const stackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const card = stackRef.current?.parentElement;
    if (!card) return;

    const observer = new ResizeObserver(([entry]) => setCardHeight(entry.contentRect.height));
    observer.observe(card);

    return () => observer.disconnect();
  }, [mounted, isDesktop]);

  const sortedNotes = useMemo(() => [...notes].sort((a, b) => a.order - b.order), [notes]);
  const openNotes = useMemo(
    () => sortedNotes.filter((note) => openIds.includes(note.id)),
    [sortedNotes, openIds]
  );

  const resolveLabel = useCallback(
    (note: StickyNote) =>
      note.label ?? t(note.labelKey && t.has(note.labelKey) ? note.labelKey : 'defaults.new'),
    [t]
  );

  const rowHeight = STICKY_NOTE_TAB_HEIGHT + STICKY_NOTE_STACK_GAP;
  const capacity = Math.max(1, Math.floor((cardHeight - STICKY_NOTE_STACK_TOP) / rowHeight) - 1);
  const hasOverflow = sortedNotes.length > capacity;
  const visibleNotes = hasOverflow ? sortedNotes.slice(0, Math.max(1, capacity - 1)) : sortedNotes;
  const hiddenCount = sortedNotes.length - visibleNotes.length;

  const getAnchor = useCallback(() => {
    const card = stackRef.current?.parentElement?.getBoundingClientRect();

    if (!card) return { x: 16, y: 120 };

    return { x: card.left - STICKY_NOTE_PANEL_SIZE.width - 24, y: card.top };
  }, []);

  const openNoteEditor = (note: StickyNote) => {
    openDrawer({
      title: resolveLabel(note),
      component: <StickyNoteEditor note={note} label={resolveLabel(note)} onDelete={closeDrawer} />,
      placement: 'bottom',
      size: 'lg',
    });
  };

  const handleSelect = (note: StickyNote) => {
    if (isDesktop) {
      closeDrawer();
      openNote(note.id);

      return;
    }

    openNoteEditor(note);
  };

  const handleAdd = async () => {
    const note = await addNote();

    if (!isDesktop) openNoteEditor(note);
  };

  const openNotesList = () => {
    openDrawer({
      topTitle: { label: t('all'), icon: <LuStickyNote /> },
      component: (
        <StickyNotesList
          notes={sortedNotes}
          resolveLabel={resolveLabel}
          onSelect={handleSelect}
          onAdd={handleAdd}
        />
      ),
      placement: isDesktop ? 'end' : 'bottom',
      size: isDesktop ? 'sm' : 'lg',
      offset: 4,
    });
  };

  if (!mounted) return null;

  return (
    <>
      <VStack
        ref={stackRef}
        data-pw-id='sticky-notes-stack'
        position='absolute'
        top={`${STICKY_NOTE_STACK_TOP}px`}
        right='0'
        zIndex={0}
        gap={`${STICKY_NOTE_STACK_GAP}px`}
        alignItems='flex-end'
        display={{ base: 'none', lg: 'flex' }}
      >
        {visibleNotes.map((note) => (
          <StickyNoteTab
            key={note.id}
            label={resolveLabel(note)}
            ariaLabel={t('open', { label: resolveLabel(note) })}
            color={note.color}
            height={note.height}
            active={openIds.includes(note.id)}
            testId={`sticky-note-tab-${note.id}`}
            onClick={() => toggleNote(note.id)}
          />
        ))}

        {hasOverflow && (
          <Tooltip
            openDelay={100}
            closeDelay={100}
            content={t('showAll')}
            positioning={{ placement: 'right', offset: { mainAxis: 12, crossAxis: 0 } }}
          >
            <StickyNoteTab
              label={`+${hiddenCount}`}
              ariaLabel={t('showAll')}
              height={STICKY_NOTE_TAB_HEIGHT}
              testId='sticky-note-overflow'
              onClick={openNotesList}
            />
          </Tooltip>
        )}

        <Tooltip
          openDelay={100}
          closeDelay={100}
          content={t('add')}
          positioning={{ placement: 'right', offset: { mainAxis: 12, crossAxis: 0 } }}
        >
          <StickyNoteTab
            ariaLabel={t('add')}
            height={STICKY_NOTE_TAB_HEIGHT}
            icon={<LuPlus />}
            pullOnHover={false}
            testId='sticky-note-add'
            onClick={() => void handleAdd()}
          />
        </Tooltip>
      </VStack>

      <Box display={{ base: 'block', lg: 'none' }}>
        <IconButton
          data-pw-id='sticky-notes-fab'
          aria-label={t('all')}
          onClick={openNotesList}
          position='fixed'
          right='0'
          top='45%'
          zIndex={1001}
          borderLeftRadius='md'
          borderRightRadius='none'
          size='lg'
          shadow='-3px 5px 12px rgba(0, 0, 0, 0.18)'
          bg={{ base: 'yellow.200', _dark: 'yellow.300' }}
          color='yellow.950'
          _hover={{ bg: { base: 'yellow.300', _dark: 'yellow.400' } }}
        >
          <LuStickyNote />
        </IconButton>
      </Box>

      {isDesktop &&
        openNotes.map((note, index) => (
          <StickyNotePanel
            key={note.id}
            note={note}
            label={resolveLabel(note)}
            index={index}
            getAnchor={getAnchor}
          />
        ))}
    </>
  );
};
