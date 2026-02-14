import React from 'react';
import { getUserLocale } from '@/services/locale.service';
import { getTranslations } from 'next-intl/server';
import { WrapSections } from '@/components/Layout/WrapSections';
import { MainContainer } from '@/components/Layout/MainContainer';
import { Metadata } from 'next';
import { keywords } from '@/constants/Keywords';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getUserLocale();
  const t = await getTranslations({ locale, namespace: 'meta.pomodoro' });

  return {
    title: t('title'),
    description: t('description'),
    icons: './favicon.ico',
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: 'https://pitmydoro.com',
      siteName: 'Pit My Doro',
      images: [
        {
          url: 'https://pitmydoro.com/images/cover.png',
          width: 1200,
          height: 630,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['https://pitmydoro.com/images/cover.png'],
    },
    keywords: keywords,
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MainContainer>{children}</MainContainer>
      <WrapSections />
    </>
  );
}
