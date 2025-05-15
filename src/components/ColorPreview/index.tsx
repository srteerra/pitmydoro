import { Box, Flex } from '@chakra-ui/react';
import React from 'react';

interface Props {
  colors: any;
}

export const ColorPreview = ({ colors }: Props) => {
  return (
    <Flex>
      <Box bg={colors['primary']?.default} w={7} h={7} ml={'0px'} borderRadius='full' />

      <Box bg={colors['secondary']?.default} w={7} h={7} ml={'-5px'} borderRadius='full' />

      <Box bg={colors['background']?.session} w={7} h={7} ml={'-5px'} borderRadius='full' />

      <Box bg={colors['background']?.longBreak} w={7} h={7} ml={'-5px'} borderRadius='full' />

      <Box bg={colors['background']?.shortBreak} w={7} h={7} ml={'-5px'} borderRadius='full' />
    </Flex>
  );
};
