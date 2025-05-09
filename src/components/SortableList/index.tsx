import React, { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { Active, UniqueIdentifier } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { SortableItem, DragHandle } from './components/SortableItem';
import { SortableOverlay } from './components/SortableOverlay';
import { Box, VStack } from '@chakra-ui/react';

interface BaseItem {
  id: UniqueIdentifier;
}

interface Props<T extends BaseItem> {
  items: T[];

  onChange(items: T[]): void;

  renderItem(item: T): ReactNode;
}

export function SortableList<T extends BaseItem>({ items, onChange, renderItem }: Props<T>) {
  const [active, setActive] = useState<Active | null>(null);
  const activeItem = useMemo(() => items.find((item) => item.id === active?.id), [active, items]);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <Box w={'100%'}>
      <DndContext
        sensors={sensors}
        onDragStart={({ active }) => {
          setActive(active);
        }}
        onDragEnd={({ active, over }) => {
          if (over && active.id !== over?.id) {
            const activeIndex = items.findIndex(({ id }) => id === active.id);
            const overIndex = items.findIndex(({ id }) => id === over.id);

            onChange(arrayMove(items, activeIndex, overIndex));
          }
          setActive(null);
        }}
        onDragCancel={() => {
          setActive(null);
        }}
      >
        <SortableContext items={items}>
          <VStack gap={3} w={'100'} display='flex' role='application'>
            {items.map((item) => (
              <React.Fragment key={item.id}>{renderItem(item)}</React.Fragment>
            ))}
          </VStack>
        </SortableContext>
        <SortableOverlay>{activeItem ? renderItem(activeItem) : null}</SortableOverlay>
      </DndContext>
    </Box>
  );
}

SortableList.Item = SortableItem;
SortableList.DragHandle = DragHandle;
