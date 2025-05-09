'use client';
import { ChakraProvider, createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';
import { ThemeProvider } from 'next-themes';
import React, { useMemo } from 'react';
import useSessionStore from '@/stores/Session.store';
import usePomodoroStore from '@/stores/Pomodoro.store';

export default function RootLayout(props: { children: React.ReactNode }) {
  const currentScuderia = usePomodoroStore((state) => state.currentScuderia);
  const sessionStatus = useSessionStore((state) => state.status);

  const theme = useMemo(() => {
    return defineConfig({
      globalCss: {
        body: {
          fontFamily: "'Poppins', sans-serif",
          backgroundColor: {
            base:
              currentScuderia?.colors?.background?.[sessionStatus] ?? '{colors.background.light}',
            _dark: '{colors.background.dark}',
          },
          transition: 'background-color 0.5s ease-in-out',
        },
      },
      theme: {
        keyframes: {
          slideDown: {
            '0%': { transform: 'translateY(-100%)', opacity: 0 },
            '100%': { transform: 'translateY(0)', opacity: 1 },
          },
        },
        tokens: {
          animations: {
            slideDown: { value: 'slideDown 1s ease-in-out' },
          },
          fonts: {
            counter: { value: "'Kumar One', sans-serif" },
          },
          colors: {
            activeTabBg: {
              value: currentScuderia?.colors?.background?.[sessionStatus] ?? 'gray.700',
            },
            background: {
              light: { value: '#FFF3E2' },
              dark: { value: '#0A0A0A' },
            },
            light: {
              0: { value: '#FFFFFF' },
              50: { value: '#F8F8F8' },
              100: { value: '#FAFAFA' },
              150: { value: '#EFEFEF' },
            },
            dark: {
              50: { value: '#000000' },
              100: { value: '#0A0A0A' },
              200: { value: '#171717' },
              300: { value: '#262626' },
              400: { value: '#373737' },
              500: { value: '#525252' },
            },
            danger: {
              value: '#ef4444',
            },
            warning: {
              value: '#ca8a04',
            },
            primary: {
              default: { value: currentScuderia?.colors?.primary.default ?? '#486192' },
              defaultDark: { value: currentScuderia?.colors?.primary?.dark ?? '#2E3A4D' },
            },
            secondary: {
              default: { value: currentScuderia?.colors?.secondary.default ?? '#FFD700' },
              defaultDark: { value: currentScuderia?.colors?.secondary?.dark ?? '#2E3A4D' },
            },
          },
        },
        semanticTokens: {
          fonts: {
            body: { value: "'Poppins', sans-serif" },
            heading: { value: "'Poppins', sans-serif" },
          },
          colors: {
            background: {
              solid: { value: '{colors.background.50}' },
              contrast: { value: '{colors.background.100}' },
              fg: { value: '{colors.background.400}' },
              muted: { value: '{colors.background.100}' },
              subtle: { value: '{colors.background.200}' },
              emphasized: { value: '{colors.background.300}' },
              focusRing: { value: '{colors.background.400}' },
            },
          },
        },
      },
    });
  }, [currentScuderia, sessionStatus]);

  const system = createSystem(defaultConfig, theme);

  return (
    <ChakraProvider value={system}>
      <ThemeProvider attribute='class' disableTransitionOnChange>
        {props.children}
      </ThemeProvider>
    </ChakraProvider>
  );
}
