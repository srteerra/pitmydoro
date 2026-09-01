import { useTranslations } from 'next-intl';

export const useSeo = () => {
  const t = useTranslations('meta');

  const baseUrl = 'https://pitmydoro.com';

  return {
    title: t('title'),
    description: t('description'),
    canonical: baseUrl,
    openGraph: {
      url: baseUrl,
      title: t('ogTitle'),
      description: t('ogDescription'),
      site_name: 'Pitmydoro',
      images: [
        {
          url: `${baseUrl}/images/cover.png`,
          width: 1200,
          height: 630,
          alt: 'Pitmydoro',
        },
      ],
    },
    twitter: {
      cardType: 'summary_large_image',
    },
  };
};
