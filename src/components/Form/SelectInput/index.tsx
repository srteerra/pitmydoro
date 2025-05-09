import { createListCollection, Flex } from '@chakra-ui/react';
import React, { useState } from 'react';
import {
  SelectContent,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  SelectItem,
  SelectLabel,
} from '@/components/ui/select';
import { IOption } from '@/interfaces/Option.interface';

interface Props {
  onChange: (value: boolean) => void;
  label: string;
  collection: IOption[];
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  placeholder?: string;
  portalDisabled?: boolean;
  value?: string[];
  defaultValue?: string[];
}

export const SelectInput = ({
  onChange,
  label,
  collection,
  placeholder,
  value,
  size = 'md',
  portalDisabled = false,
  defaultValue,
}: Props) => {
  const [selected, setSelected] = useState<string[]>(value || defaultValue || []);
  const options = createListCollection({
    items: collection,
  });

  const handleChange = (e: any) => {
    onChange(e.value);
    setSelected(e.value);
  };

  return (
    <SelectRoot
      size={size}
      value={selected}
      onValueChange={handleChange}
      collection={options}
    >
      <Flex alignItems={'center'} gap={2}>
        <SelectLabel>
          <strong>{label}</strong>
        </SelectLabel>
      </Flex>

      <SelectTrigger>
        <SelectValueText paddingX={'5px'} placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent portalled={!portalDisabled}>
        {options.items.map((item: IOption) => (
          <SelectItem item={item} key={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
};
