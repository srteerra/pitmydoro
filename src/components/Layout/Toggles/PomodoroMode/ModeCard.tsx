'use client';

import { Box, HStack, Image, Menu, Text, VStack } from '@chakra-ui/react';
import { BsCheck2 } from 'react-icons/bs';

export type ModeCardTheme = 'racing' | 'minimal';

interface Props {
  value: string;
  label: string;
  description: string;
  theme: ModeCardTheme;
  active: boolean;
  carURL?: string;
  onSelect: () => void;
}

const RED = '#E10600';

const SURFACES = {
  racing: {
    base: {
      color: 'gray.800',
      background: '#FFFDF8',
    },
    dark: {
      color: 'gray.200',
      background: '#1A1D21',
    },
    accent: RED,
  },
  minimal: {
    base: {
      color: 'gray.800',
      background: '#FFFDF8',
    },
    dark: {
      color: 'gray.200',
      background: '#232326',
    },
    accent: '#8B8B90',
  },
} as const;

const FADE_MASK =
  'linear-gradient(to left, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 34%, rgba(0, 0, 0, 0) 88%)';

export const ModeCard = ({ value, label, description, theme, active, carURL, onSelect }: Props) => {
  const surface = SURFACES[theme];

  return (
    <Menu.Item
      data-pw-id={`pomodoro-mode-${value}`}
      value={value}
      onClick={onSelect}
      padding={0}
      width='full'
      cursor='pointer'
      borderRadius='xl'
      focusRing='none'
      _hover={{ background: 'transparent' }}
      _highlighted={{ background: 'transparent' }}
    >
      <Box
        position='relative'
        overflow='hidden'
        width='full'
        height='98px'
        borderRadius='xl'
        borderWidth={active ? '2px' : '1px'}
        borderColor={{
          _dark: 'whiteAlpha.200',
          base: `${active ? 'blackAlpha.400' : 'blackAlpha.200'}`,
        }}
        {...surface.base}
        _dark={surface.dark}
      >
        {theme === 'racing' && carURL && (
          <Image
            src={carURL}
            alt=''
            aria-hidden='true'
            position='absolute'
            right='-26px'
            bottom='-10px'
            width='236px'
            opacity={0.3}
            filter='grayscale(0.35) contrast(1.15)'
            css={{
              imageRendering: 'pixelated',
              maskImage: FADE_MASK,
              WebkitMaskImage: FADE_MASK,
            }}
          />
        )}

        {theme === 'minimal' && (
          <Box
            position='absolute'
            right='-34px'
            top='50%'
            transform='translateY(-50%)'
            boxSize='128px'
            borderRadius='full'
            borderWidth='10px'
            borderColor='currentColor'
            opacity={0.12}
            css={{ maskImage: FADE_MASK, WebkitMaskImage: FADE_MASK }}
          />
        )}

        <HStack position='relative' height='full' align='center' paddingX={5}>
          <VStack align='start' gap={1.5} maxWidth='64%'>
            <Text fontWeight='semibold' fontSize='sm' lineHeight='1' letterSpacing='tight'>
              {label}
            </Text>
            <Text fontSize='2xs' opacity={0.6} lineHeight='short'>
              {description}
            </Text>
          </VStack>
        </HStack>

        {active && (
          <Box
            position='absolute'
            top={3}
            right={3}
            display='flex'
            alignItems='center'
            justifyContent='center'
            boxSize='18px'
            borderRadius='full'
            background={surface.accent}
            color='white'
            fontSize='11px'
          >
            <BsCheck2 />
          </Box>
        )}
      </Box>
    </Menu.Item>
  );
};
