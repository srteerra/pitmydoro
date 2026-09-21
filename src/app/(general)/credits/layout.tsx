import React from 'react';
import { Metadata } from 'next';
import { getUserLocale } from '@/services/locale.service';
import { getTranslations } from 'next-intl/server';
import { breadcrumbLd, buildMetadata } from '@/utils/seo.utils';

const path = '/credits';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getUserLocale();
  const t = await getTranslations({ locale, namespace: 'meta.credits' });

  return buildMetadata({
    title: t('title'),
    description: t('description'),
    path,
    type: 'article',
  });
}

export default async function CreditsLayout({ children }: { children: React.ReactNode }) {
  const locale = await getUserLocale();
  const t = await getTranslations({ locale, namespace: 'meta.credits' });

  const breadcrumb = breadcrumbLd([
    { name: 'Home', path: '' },
    { name: t('title'), path },
  ]);

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      {children}
    </>
  );
}
