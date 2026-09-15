import React from 'react';
import { Metadata } from 'next';
import { getUserLocale } from '@/services/locale.service';
import { getTranslations } from 'next-intl/server';
import { MainContainer } from '@/components/Layout/MainContainer';
import { breadcrumbLd, buildMetadata } from '@/utils/seo.utils';

const path = '/terms';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getUserLocale();
  const t = await getTranslations({ locale, namespace: 'meta.terms' });

  return buildMetadata({
    title: t('title'),
    description: t('description'),
    path,
    type: 'article',
  });
}

export default async function TermsLayout({ children }: { children: React.ReactNode }) {
  const locale = await getUserLocale();
  const t = await getTranslations({ locale, namespace: 'meta.terms' });

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
      <MainContainer customGrid='4fr 12fr 4fr'>{children}</MainContainer>
    </>
  );
}
