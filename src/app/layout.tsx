import ChakraUIProvider from './chakraUIProvider';
import React from 'react';
import './globals.css';
import { ColorModeProvider } from '@/components/ui/color-mode';
import { NextIntlClientProvider } from 'next-intl';
import { Metadata } from 'next';
import Head from 'next/head';
import { AuthProvider } from '@/contexts/AuthContext';
import { keywords } from '@/constants/Keywords';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Pit My Doro',
  icons: './favicon.ico',
  alternates: {
    canonical: 'https://pitmydoro.com',
    languages: {
      'en-US': 'https://pitmydoro.com',
      'de-DE': 'https://pitmydoro.com',
    },
  },
  keywords: keywords,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={'en'} suppressHydrationWarning>
      <Head>
        <meta property='og:title' content='PitMyDoro' />
        <meta property='og:description' content='An online F1 style Pomodoro timer.' />
        <meta property='og:url' content='https://pitmydoro.com/' />
        <meta property='og:type' content='website' />
        <meta property='og:image' content='https://pitmydoro.com/images/cover.png' />
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:title' content='PitMyDoro' />
        <meta name='twitter:description' content='An online F1 style Pomodoro timer.' />
        <meta name='twitter:image' content='https://pitmydoro.com/images/cover.png' />
      </Head>

      <body>
        <NextIntlClientProvider>
          <ChakraUIProvider>
            <AuthProvider>
              <ColorModeProvider enableSystem={false}>
                <Toaster />
                {children}
              </ColorModeProvider>
            </AuthProvider>
          </ChakraUIProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
