'use client';

import React from 'react';
import { Box, Flex, HStack, IconButton, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import tinycolor from 'tinycolor2';
import { LuRotateCcw } from 'react-icons/lu';
import { useTranslations } from 'next-intl';
import { Tooltip } from '@/components/ui/tooltip';
import { PROFILE_BACKGROUNDS } from '@/constants/ProfileBackgrounds';
import { bannerFromColor } from '@/utils/profileTheme.utils';

interface Props {
  value: string | null;
  onChange: (color: string | null) => void;
}

const Swatch = ({
  color,
  selected,
  label,
  onSelect,
}: {
  color: string | null;
  selected: boolean;
  label: string;
  onSelect: () => void;
}) => (
  <Tooltip content={label} openDelay={200} closeDelay={50}>
    <Box
      as='button'
      onClick={onSelect}
      aria-label={label}
      aspectRatio={1}
      w='full'
      borderRadius='xl'
      borderWidth='3px'
      cursor='pointer'
      bg={bannerFromColor(color)}
      borderColor={selected ? tinycolor(bannerFromColor(color)).darken(24).toString() : 'border'}
      transform={selected ? 'scale(1.06)' : 'scale(1)'}
      boxShadow={selected ? 'md' : 'none'}
      transition='all 0.15s ease'
      _hover={{ transform: selected ? 'scale(1.06)' : 'scale(1.03)' }}
      _active={{ transform: 'scale(0.97)' }}
    />
  </Tooltip>
);

export const BackgroundPicker = ({ value, onChange }: Props) => {
  const t = useTranslations('profile');

  return (
    <VStack align='stretch' gap={3}>
      <Flex align='baseline' justify='space-between' gap={2}>
        <Text
          fontSize='xs'
          fontWeight='bold'
          textTransform='uppercase'
          letterSpacing='wider'
          color='fg.muted'
        >
          {t('chooseBackground')}
        </Text>

        <HStack gap={2}>
          <Text fontSize='sm' fontWeight='semibold' color='fg' textTransform='uppercase'>
            {value ?? t('defaultBackground')}
          </Text>
          {value && (
            <Tooltip content={t('resetBackground')} openDelay={200} closeDelay={50}>
              <IconButton
                aria-label={t('resetBackground')}
                onClick={() => onChange(null)}
                variant='ghost'
                rounded='full'
                size='xs'
              >
                <LuRotateCcw />
              </IconButton>
            </Tooltip>
          )}
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 5, sm: 7 }} gap={3}>
        <Swatch
          color={null}
          label={t('defaultBackground')}
          selected={!value}
          onSelect={() => onChange(null)}
        />

        {PROFILE_BACKGROUNDS.map((item) => (
          <Swatch
            key={item.id}
            color={item.color}
            label={item.color}
            selected={value === item.color}
            onSelect={() => onChange(item.color)}
          />
        ))}
      </SimpleGrid>
    </VStack>
  );
};
