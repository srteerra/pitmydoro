import Provider from './provider';
import React from 'react';
import './globals.css';
import { ColorModeProvider } from '@/components/ui/color-mode';
import { MainContainer } from '@/components/MainContainer';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { NextIntlClientProvider } from 'next-intl';
import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={'en'} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider>
          <Provider>
            <ColorModeProvider>
              <MainContainer>
                <Header />
                <Toaster position="top-right" />
                {children}
                <Footer />
              </MainContainer>
            </ColorModeProvider>
          </Provider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
