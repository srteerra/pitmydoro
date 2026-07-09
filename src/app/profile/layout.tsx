'use client';

import React from 'react';
import { Box } from '@chakra-ui/react';
import { Header } from '@/components/Layout/Header';
import { SCUDERIAS } from '@/constants/Scuderias';
import useProfileThemeStore from '@/stores/ProfileTheme.store';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const team = useProfileThemeStore((state) => state.team) ?? SCUDERIAS[0];
  const sessionColor = team?.colors.background.session;

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
