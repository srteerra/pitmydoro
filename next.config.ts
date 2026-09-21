import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin({});

const nextConfig: NextConfig = {
  devIndicators: {
    position: 'bottom-right',
  },
  experimental: {
    optimizePackageImports: ['@chakra-ui/react'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pitmydoro.com',
      },
      {
        protocol: 'https',
        hostname: 'www.pitmydoro.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.buymeacoffee.com',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
