'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Box, Button, Center, Flex, Spinner, Text, VStack } from '@chakra-ui/react';
import { LuArrowLeft, LuLock } from 'react-icons/lu';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import tinycolor from 'tinycolor2';
import { BadgeDefinition } from '@/interfaces/Badge.interface';

const BadgeMedal = dynamic(
  () => import('@/components/Profile/Badges/BadgeMedal').then((mod) => mod.BadgeMedal),
  {
    ssr: false,
    loading: () => (
      <Center h={{ base: '240px', md: '280px' }}>
        <Spinner />
      </Center>
    ),
  }
);

interface Props {
  badge: BadgeDefinition;
  locked?: boolean;
  onBack?: () => void;
}

export const BadgeDialog = ({ badge, locked = false, onBack }: Props) => {
  const t = useTranslations('badges');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const glowColor = locked ? tinycolor(badge.color).desaturate(88) : tinycolor(badge.color);
  const glow = glowColor.setAlpha(isDark ? 0.22 : 0.16).toRgbString();
  const dotColor = locked ? tinycolor(badge.color).desaturate(88).toString() : badge.color;

  return (
    <VStack data-pw-id='badge-dialog' data-locked={locked} align='stretch' gap={5} pb={2}>
      <Box
        position='relative'
        borderRadius='2xl'
        overflow='hidden'
        bg={`radial-gradient(circle at 50% 45%, ${glow}, transparent 68%)`}
      >
        <BadgeMedal
          color={badge.color}
          glyph={badge.glyph}
          label={t(`${badge.id}.name`)}
          locked={locked}
        />

        {locked && (
          <Flex
            position='absolute'
            top={3}
            right={3}
            align='center'
            gap={1.5}
            paddingX={2.5}
            paddingY={1}
            borderRadius='full'
            borderWidth='1px'
            borderColor='border'
            bg='bg.muted'
            color='fg.muted'
            pointerEvents='none'
          >
            <LuLock size={12} />
            <Text fontSize='2xs' fontWeight='semibold' lineHeight='1'>
              {t('lockedLabel')}
            </Text>
          </Flex>
        )}
      </Box>

      <VStack align='start' gap={2} paddingX={1}>
        <Flex align='center' gap={2.5}>
          <Box boxSize='10px' borderRadius='full' bg={dotColor} flexShrink={0} />
          <Text fontSize='xl' fontWeight='bold'>
            {t(`${badge.id}.name`)}
          </Text>
        </Flex>
        <Text fontSize='sm' color='fg.muted' lineHeight='tall'>
          {t(`${badge.id}.description`)}
        </Text>
        {locked && (
          <Text fontSize='sm' color='fg.muted' lineHeight='tall'>
            {t('lockedHint')}
          </Text>
        )}
      </VStack>

      <Text fontSize='xs' color='fg.muted' textAlign='center'>
        {t('dragHint')}
      </Text>

      {onBack && (
        <Button
          data-pw-id='badge-dialog-back'
          onClick={onBack}
          variant='outline'
          size='sm'
          alignSelf='center'
        >
          <LuArrowLeft size={14} />
          {t('backToPicker')}
        </Button>
      )}
    </VStack>
  );
};
