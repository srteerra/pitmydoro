'use client';

import React from 'react';
import { Badge, type BadgeProps, Box } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';

interface InDevelopmentBadgeProps extends BadgeProps {
  label?: string;
}

export const InDevelopmentBadge = ({
  label,
  colorPalette = 'orange',
  ...props
}: InDevelopmentBadgeProps) => {
  const t = useTranslations('streamOverlay');

  return (
    <Badge
      variant='outline'
      colorPalette={colorPalette}
      rounded='full'
      px={3}
      py={1}
      fontSize='xs'
      textTransform='uppercase'
      letterSpacing='wide'
      display='inline-flex'
      alignItems='center'
      gap={2}
      borderWidth='1px'
      bgColor={{ base: 'orange.50', _dark: 'orange.500/20' }}
      borderColor='currentColor'
      {...props}
    >
      <Box w='6px' h='6px' rounded='full' bg='currentColor' flexShrink={0} />
      {label ?? t('inDevelopment')}
    </Badge>
  );
};
