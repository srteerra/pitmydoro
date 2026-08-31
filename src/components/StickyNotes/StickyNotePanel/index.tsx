'use client';

import { useEffect, useState } from 'react';
import { FloatingPanel, HStack, Portal } from '@chakra-ui/react';
import { LuGripVertical, LuX } from 'react-icons/lu';
import { useTranslations } from 'next-intl';
import { StickyNote } from '@/interfaces/StickyNote.interface';
import {
  STICKY_NOTE_PALETTE,
  STICKY_NOTE_PANEL_CASCADE,
  STICKY_NOTE_PANEL_EDGE,
  STICKY_NOTE_PANEL_MIN_SIZE,
  STICKY_NOTE_PANEL_SIZE,
} from '@/constants/StickyNotes';
import { useStickyNotes } from '@/hooks/useStickyNotes';
import { StickyNoteEditor } from '@/components/StickyNotes/StickyNoteEditor';

interface StickyNotePanelProps {
  note: StickyNote;
  label: string;
  index: number;
  getAnchor: () => { x: number; y: number };
}

const clampToViewport = (point: { x: number; y: number }, size = STICKY_NOTE_PANEL_SIZE) => {
  const maxX = window.innerWidth - Math.min(size.width, window.innerWidth) - STICKY_NOTE_PANEL_EDGE;
  const maxY =
    window.innerHeight - Math.min(size.height, window.innerHeight) - STICKY_NOTE_PANEL_EDGE;

  return {
    x: Math.min(Math.max(STICKY_NOTE_PANEL_EDGE, point.x), Math.max(STICKY_NOTE_PANEL_EDGE, maxX)),
    y: Math.min(Math.max(STICKY_NOTE_PANEL_EDGE, point.y), Math.max(STICKY_NOTE_PANEL_EDGE, maxY)),
  };
};

const initialPosition = (anchor: { x: number; y: number }, index: number) => {
  const offset = index * STICKY_NOTE_PANEL_CASCADE;

  return clampToViewport({ x: anchor.x + offset, y: anchor.y + offset });
};

export const StickyNotePanel = ({ note, label, index, getAnchor }: StickyNotePanelProps) => {
  const t = useTranslations('stickyNotes');
  const { closeNote } = useStickyNotes();
  const [position, setPosition] = useState(() => initialPosition(getAnchor(), index));
  const [size, setSize] = useState(STICKY_NOTE_PANEL_SIZE);
  const palette = STICKY_NOTE_PALETTE[note.color];

  useEffect(() => {
    const handleResize = () => setPosition((current) => clampToViewport(current, size));
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [size]);

  return (
    <FloatingPanel.Root
      open
      onOpenChange={(details) => !details.open && closeNote(note.id)}
      position={position}
      onPositionChange={(details) => setPosition(details.position)}
      defaultSize={STICKY_NOTE_PANEL_SIZE}
      onSizeChange={(details) => setSize(details.size)}
      minSize={STICKY_NOTE_PANEL_MIN_SIZE}
      allowOverflow={false}
    >
      <Portal>
        <FloatingPanel.Positioner zIndex={1100} hideBelow='lg'>
          <FloatingPanel.Content
            data-pw-id='sticky-note-panel'
            bg={{ base: palette.surface, _dark: palette.surfaceDark }}
            color={{ base: palette.text, _dark: palette.textDark }}
            borderColor={{ base: palette.accent, _dark: palette.accentDark }}
            borderWidth='1px'
            rounded='lg'
            shadow='lg'
          >
            <FloatingPanel.Header
              borderBottomWidth='1px'
              borderColor={{ base: palette.accent, _dark: palette.accentDark }}
            >
              <FloatingPanel.DragTrigger
                flex='1'
                cursor='grab'
                _active={{ cursor: 'grabbing' }}
                minWidth={0}
              >
                <HStack gap={2} minWidth={0}>
                  <LuGripVertical />
                  <FloatingPanel.Title fontSize='sm' fontWeight='semibold' truncate>
                    {label}
                  </FloatingPanel.Title>
                </HStack>
              </FloatingPanel.DragTrigger>

              <FloatingPanel.Control>
                <FloatingPanel.CloseTrigger
                  data-pw-id='sticky-note-panel-close'
                  aria-label={t('close')}
                  color={{ base: palette.text, _dark: palette.textDark }}
                >
                  <LuX />
                </FloatingPanel.CloseTrigger>
              </FloatingPanel.Control>
            </FloatingPanel.Header>

            <FloatingPanel.Body display='flex' flexDirection='column' overflow='hidden'>
              <StickyNoteEditor note={note} label={label} onDelete={() => closeNote(note.id)} />
            </FloatingPanel.Body>

            <FloatingPanel.ResizeTriggers />
          </FloatingPanel.Content>
        </FloatingPanel.Positioner>
      </Portal>
    </FloatingPanel.Root>
  );
};
