import { DataList } from '@chakra-ui/react';
import { InfoTip } from '@/components/ui/toggle-tip';
import React, { JSX, ReactNode } from 'react';

interface StatItem {
  label: string;
  value: ReactNode;
  info?: string;
  icon?: JSX.Element;
  valueIcon?: JSX.Element;
}

export const StatsList = ({ items }: { items: StatItem[] }) => (
  <DataList.Root orientation='horizontal'>
    {items.map((item) => (
      <DataList.Item key={item.label}>
        <DataList.ItemLabel opacity={0.7} gap={2}>
          {item.icon} {item.label}
        </DataList.ItemLabel>
        <DataList.ItemValue display='flex' gap={3} alignItems='center'>
          {item.valueIcon && item.valueIcon}
          {item.value}
          {item.info && <InfoTip>{item.info}</InfoTip>}
        </DataList.ItemValue>
      </DataList.Item>
    ))}
  </DataList.Root>
);
