import { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/constants/Site';

export const OG_IMAGE = `${SITE_URL}/images/cover.png`;

export const canonicalUrl = (path = '') => `${SITE_URL}${path}`;

interface BuildMetadataOptions {
  title: string;
  description: string;
  path?: string;
  type?: 'website' | 'article';
  keywords?: string | string[];
  noIndex?: boolean;
}

export const buildMetadata = ({
  title,
  description,
  path = '',
  type = 'website',
  keywords,
  noIndex = false,
}: BuildMetadataOptions): Metadata => {
  const url = canonicalUrl(path);

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG_IMAGE],
    },
  };
};

export const breadcrumbLd = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: canonicalUrl(item.path),
  })),
});
