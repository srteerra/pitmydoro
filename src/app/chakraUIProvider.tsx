'use client';

import { ChakraProvider, createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';
import { ThemeProvider } from 'next-themes';
import React, { useEffect, useMemo, useState } from 'react';
import useSessionStore from '@/stores/Session.store';
import useSettingsStore from '@/stores/Settings.store';

export default function ChakraUIProvider(props: { children: React.ReactNode }) {
  const currentScuderia = useSettingsStore((state) => state.currentScuderia);
  const sessionStatus = useSessionStore((state) => state.status);
  const [isClient, setIsClient] = useState(false);

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
              dark: { value: '#101010' },
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
            brand: {
              50: { value: '#fff1f0' },
              100: { value: '#ffe0de' },
              200: { value: '#ffc4c1' },
              300: { value: '#ffa09c' },
              400: { value: '#ff8985' },
              500: { value: '#ff716d' },
              600: { value: '#ed5551' },
              700: { value: '#c93f3c' },
              800: { value: '#a3332f' },
              900: { value: '#852f2c' },
              950: { value: '#481413' },
            },
            accent: {
              50: { value: '#eafbf8' },
              100: { value: '#c9f3ec' },
              200: { value: '#9ce8dd' },
              300: { value: '#6dd6cf' },
              400: { value: '#42c4bb' },
              500: { value: '#26aaa1' },
              600: { value: '#1b8a83' },
              700: { value: '#196e69' },
              800: { value: '#195854' },
              900: { value: '#194947' },
              950: { value: '#082a29' },
            },
            danger: {
              value: '#ef4444',
            },
            warning: {
              value: '#ca8a04',
            },
            success: {
              value: '#10b981',
            },
            primary: {
              default: { value: currentScuderia?.colors?.primary?.default ?? '#486192' },
              defaultDark: { value: currentScuderia?.colors?.primary?.dark ?? '#2E3A4D' },
            },
            secondary: {
              default: { value: currentScuderia?.colors?.secondary?.default ?? '#FFD700' },
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
            brand: {
              solid: { value: '{colors.brand.500}' },
              contrast: { value: 'white' },
              fg: { value: { base: '{colors.brand.700}', _dark: '{colors.brand.300}' } },
              muted: { value: { base: '{colors.brand.100}', _dark: '{colors.brand.900}' } },
              subtle: { value: { base: '{colors.brand.50}', _dark: '{colors.brand.950}' } },
              emphasized: { value: { base: '{colors.brand.200}', _dark: '{colors.brand.800}' } },
              focusRing: { value: '{colors.brand.500}' },
            },
            accent: {
              solid: { value: '{colors.accent.500}' },
              contrast: { value: 'white' },
              fg: { value: { base: '{colors.accent.700}', _dark: '{colors.accent.300}' } },
              muted: { value: { base: '{colors.accent.100}', _dark: '{colors.accent.900}' } },
              subtle: { value: { base: '{colors.accent.50}', _dark: '{colors.accent.950}' } },
              emphasized: { value: { base: '{colors.accent.200}', _dark: '{colors.accent.800}' } },
              focusRing: { value: '{colors.accent.500}' },
            },
          },
        },
      },
    });
  }, [currentScuderia, sessionStatus]);

  const system = createSystem(defaultConfig, theme);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <ChakraProvider value={system}>
      <ThemeProvider defaultTheme={'light'} attribute='class' disableTransitionOnChange>
        {props.children}
      </ThemeProvider>
    </ChakraProvider>
  );
}
