'use client';

import React, { useMemo, useState } from 'react';
import { Box, Button, Flex, Input, Popover, Portal, SimpleGrid, Text, VStack, } from '@chakra-ui/react';
import { LuFlag } from 'react-icons/lu';
import { useLocale, useTranslations } from 'use-intl';
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
  const [query, setQuery] = useState('');

  const flags = useMemo(() => getCountryFlags(locale), [locale]);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return flags;
    return flags.filter((flag) => flag.name.toLowerCase().includes(term));
  }, [flags, query]);

  const select = (emoji: string) => {
    onChange(emoji);
    setOpen(false);
    setQuery('');
  };

  return (
    <Flex align='center' justify='space-between' gap={4}>
      <Text fontWeight='medium'>{t('favoriteFlag')}</Text>

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
                <VStack align='stretch' gap={3}>
                  <Input
                    autoFocus
                    size='sm'
                    rounded='full'
                    placeholder={t('searchCountry')}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />

                  {value && (
                    <Button
                      size='xs'
                      variant='ghost'
                      alignSelf='flex-start'
                      onClick={() => select('')}
                    >
                      {t('removeFlag')}
                    </Button>
                  )}

                  <Box maxH='220px' overflowY='auto'>
                    <SimpleGrid columns={6} gap={1}>
                      {filtered.map((flag) => (
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
                </VStack>
              </Popover.Body>
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Popover.Root>
    </Flex>
  );
};
