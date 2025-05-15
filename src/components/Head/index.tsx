import * as React from 'react';
import NextHead from 'next/head';
import { GoogleFonts } from 'next-google-fonts';

interface Props {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export const Head = ({
  title = 'Título por defecto',
  description = 'Descripción por defecto para SEO.',
  image = '/default-image.png',
  url = 'https://tusitio.com',
}: Props) => (
  <React.Fragment>
    <GoogleFonts href='https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap' />
    <NextHead>
      <meta charSet='UTF-8' />
      <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      <meta httpEquiv='x-ua-compatible' content='ie=edge' />

      <title>{title}</title>
      <meta name='description' content={description} />

      {/* Open Graph / Facebook */}
      <meta property='og:type' content='website' />
      <meta property='og:url' content={url} />
      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta property='og:image' content={image} />

      {/* Twitter */}
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:url' content={url} />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={image} />
    </NextHead>
  </React.Fragment>
);
