'use client';

import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Popover,
  Portal,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import { LuFlag, LuX } from 'react-icons/lu';
import { useLocale, useTranslations } from 'next-intl';
import { Tooltip } from '@/components/ui/tooltip';
import { getCountryFlags } from '@/constants/CountryFlags';

interface Props {
  value: string;
  onChange: (emoji: string) => void;
}

export const FlagPicker = ({ value, onChange }: Props) => {
  const t = useTranslations('profile');
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  const flags = useMemo(() => getCountryFlags(locale), [locale]);

  const select = (emoji: string) => {
    onChange(emoji);
    setOpen(false);
  };

  return (
    <Flex align='center' justify='space-between' gap={4}>
      <Text fontWeight='medium'>{t('chooseFlag')}</Text>

      <HStack gap={2}>
        <Popover.Root
          open={open}
          onOpenChange={(e) => setOpen(e.open)}
          positioning={{ placement: 'bottom-end' }}
        >
          <Popover.Trigger asChild>
            <Button variant='outline' rounded='full' minW='60px' fontSize='xl'>
              {value || <LuFlag />}
            </Button>
          </Popover.Trigger>
          <Portal>
            <Popover.Positioner>
              <Popover.Content width='280px'>
                <Popover.Body>
                  <Box maxH='220px' overflowY='auto'>
                    <SimpleGrid columns={6} gap={1}>
                      {flags.map((flag) => (
                        <Tooltip
                          key={flag.code}
                          content={flag.name}
                          openDelay={200}
                          closeDelay={50}
                        >
                          <Box
                            as='button'
                            onClick={() => select(flag.emoji)}
                            fontSize='xl'
                            padding={1.5}
                            cursor='pointer'
                            borderRadius='md'
                            bg={value === flag.emoji ? 'bg.emphasized' : 'transparent'}
                            _hover={{ bg: 'bg.muted' }}
                          >
                            {flag.emoji}
                          </Box>
                        </Tooltip>
                      ))}
                    </SimpleGrid>
                  </Box>
                </Popover.Body>
              </Popover.Content>
            </Popover.Positioner>
          </Portal>
        </Popover.Root>

        {value && (
          <Tooltip content={t('removeFlag')} openDelay={200} closeDelay={50}>
            <IconButton
              aria-label={t('removeFlag')}
              onClick={() => select('')}
              variant='ghost'
              rounded='full'
              size='sm'
            >
              <LuX />
            </IconButton>
          </Tooltip>
        )}
      </HStack>
    </Flex>
  );
};
