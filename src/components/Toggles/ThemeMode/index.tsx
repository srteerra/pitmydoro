'use client';

import { IconButton } from '@chakra-ui/react';
import { useTheme } from 'next-themes';
import { LuMoon, LuSun } from 'react-icons/lu';
import { useEffect, useState } from 'react';

export function ToggleMode() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleColorMode = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  if (!mounted) return null;

  return (
    <IconButton variant={'ghost'} rounded='full' onClick={toggleColorMode}>
      {theme === 'light' ? <LuMoon /> : <LuSun />}
    </IconButton>
  );
}
