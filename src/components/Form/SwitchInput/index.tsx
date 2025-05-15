import { Box, Flex, Switch, Text } from '@chakra-ui/react';
import React, { useState } from 'react';

interface Props {
  onChange: (value: boolean) => void;
  title: string;
  description?: string;
  value?: boolean;
  defaultValue?: boolean;
}

export const SwitchInput = ({
  onChange,
  title,
  description,
  value,
  defaultValue = false,
}: Props) => {
  const [checked, setChecked] = useState(defaultValue);

  const handleChange = (e: any) => {
    setChecked(e.checked);
    onChange(e.checked);
  };

  return (
    <Flex w='full' justifyContent='space-between'>
      <Box>
        <Text fontWeight={'medium'} textTransform={'capitalize'}>
          {title}
        </Text>
        <Text fontWeight={'light'} color={'gray.400'} fontSize={'xs'}>
          {description}
        </Text>
      </Box>

      <Switch.Root checked={value ?? checked} onCheckedChange={handleChange}>
        <Switch.HiddenInput />
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
      </Switch.Root>
    </Flex>
  );
};
