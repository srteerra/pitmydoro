'use client';

import React from 'react';
import { Box } from '@chakra-ui/react';
import { Header } from '@/components/Layout/Header';
import useProfileThemeStore from '@/stores/ProfileTheme.store';
import { DEFAULT_PROFILE_THEME } from '@/utils/profileTheme.utils';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const theme = useProfileThemeStore((state) => state.theme) ?? DEFAULT_PROFILE_THEME;
  const sessionColor = theme.background;

  return (
    <Box
      minH='100vh'
      bgColor={{
        base: sessionColor,
        _dark: 'transparent',
      }}
      transition='background-color 0.4s ease'
    >
      <Header />
      {children}
    </Box>
  );
}
