import React from 'react';
import { getUserLocale } from '@/services/locale.service';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

const url = 'https://pitmydoro.com/learn';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getUserLocale();
  const t = await getTranslations({ locale, namespace: 'meta.learn' });

  return {
    title: t('title'),
    description: t('description'),
    icons: './favicon.ico',
    alternates: {
      canonical: url,
    },
    keywords:
      'formula 1, f1, f1 for beginners, learn f1, how f1 works, f1 rules, f1 points system, f1 tire compounds, f1 pit stops, f1 race weekend, f1 championship, f1 teams, f1 glossary, f1 terms',
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
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['https://pitmydoro.com/images/cover.png'],
    },
  };
}

export default async function LearnLayout({ children }: { children: React.ReactNode }) {
  const locale = await getUserLocale();
  const t = await getTranslations({ locale, namespace: 'meta.learn' });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: t('title'),
    description: t('description'),
    inLanguage: locale,
    image: 'https://pitmydoro.com/images/cover.png',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: { '@type': 'Organization', name: 'Pit My Doro' },
    publisher: {
      '@type': 'Organization',
      name: 'Pit My Doro',
      logo: { '@type': 'ImageObject', url: 'https://pitmydoro.com/images/cover.png' },
    },
  };

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {children}
    </>
  );
}
