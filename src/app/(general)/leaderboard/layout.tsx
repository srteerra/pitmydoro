import React from 'react';
import { getUserLocale } from '@/services/locale.service';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

const url = 'https://pitmydoro.com/leaderboard';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getUserLocale();
  const t = await getTranslations({ locale, namespace: 'meta.leaderboard' });

  return {
    title: t('title'),
    description: t('description'),
    icons: './favicon.ico',
    alternates: {
      canonical: url,
    },
    keywords:
      'pomodoro leaderboard, focus ranking, productivity leaderboard, weekly focus time, monthly focus time, pomodoro ranking, deep work leaderboard',
    openGraph: {
      title: t('title'),
      description: t('description'),
      url,
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
  };
}

export default async function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  const locale = await getUserLocale();
  const t = await getTranslations({ locale, namespace: 'meta.leaderboard' });

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://pitmydoro.com' },
      { '@type': 'ListItem', position: 2, name: t('title'), item: url },
    ],
  };

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {children}
    </>
  );
}
