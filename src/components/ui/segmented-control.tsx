'use client';

import { For, SegmentGroup } from '@chakra-ui/react';
import * as React from 'react';

interface Item {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps extends SegmentGroup.RootProps {
  items: Array<string | Item>;
  isActive?: string | Item;
  activeBgColor?: string;
}

function normalize(items: Array<string | Item>): Item[] {
  return items.map((item) => {
    if (typeof item === 'string') return { value: item, label: item };
    return item;
  });
}

export const SegmentedControl = React.forwardRef<HTMLDivElement, SegmentedControlProps>(
  function SegmentedControl(props, ref) {
    const { items, isActive, activeBgColor, ...rest } = props;
    const data = React.useMemo(() => normalize(items), [items]);

    return (
      <SegmentGroup.Root ref={ref} {...rest}>
        <SegmentGroup.Indicator backgroundColor={activeBgColor} />
        <For each={data}>
          {(item) => (
            <SegmentGroup.Item
              key={item.value}
              value={item.value}
              cursor='pointer'
              maxH='30px'
              disabled={item.disabled}
            >
              <SegmentGroup.ItemText
                color={isActive && item.value === isActive ? 'white' : 'gray.600'}
              >
                {item.label}
              </SegmentGroup.ItemText>
              <SegmentGroup.ItemHiddenInput />
            </SegmentGroup.Item>
          )}
        </For>
      </SegmentGroup.Root>
    );
  }
);
