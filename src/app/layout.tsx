import ChakraUIProvider from './chakraUIProvider';
import React from 'react';
import './globals.css';
import { ColorModeProvider } from '@/components/ui/color-mode';
import { NextIntlClientProvider } from 'next-intl';
import { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import { keywords } from '@/constants/Keywords';
import { DialogProvider } from '@/contexts/DialogContext';
import { DrawerProvider } from '@/contexts/DrawerContext';
import { OverlaySync } from '@/components/StreamOverlay/OverlaySync';
import { Toaster } from '@/components/ui/toaster';
import { CookieConsent } from '@/components/CookieConsent';
import { Analytics } from '@/components/Analytics';
import { getUserLocale } from '@/services/locale.service';
import { getTranslations } from 'next-intl/server';
import { SITE_NAME, SITE_URL } from '@/constants/Site';
import { OG_IMAGE } from '@/utils/seo.utils';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getUserLocale();
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t('title'),
      template: `%s · ${SITE_NAME}`,
    },
    description: t('description'),
    applicationName: SITE_NAME,
    keywords: keywords,
    icons: './favicon.ico',
    manifest: undefined,
    alternates: {
      canonical: SITE_URL,
      languages: {
        en: SITE_URL,
        es: SITE_URL,
        'x-default': SITE_URL,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title: t('ogTitle'),
      description: t('ogDescription'),
      url: SITE_URL,
      locale,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('ogTitle'),
      description: t('ogDescription'),
      images: [OG_IMAGE],
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getUserLocale();

  const organizationLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    url: SITE_URL,
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web',
    image: OG_IMAGE,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />

        <NextIntlClientProvider>
          <ChakraUIProvider>
            <AuthProvider>
              <DialogProvider>
                <DrawerProvider>
                  <ColorModeProvider enableSystem={false}>
                    <OverlaySync />
                    <Toaster />
                    <div className='app-zoom'>{children}</div>
                    <Analytics />
                    <CookieConsent />
                  </ColorModeProvider>
                </DrawerProvider>
              </DialogProvider>
            </AuthProvider>
          </ChakraUIProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
