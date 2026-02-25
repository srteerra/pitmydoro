import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin({});
const isCI = !!process.env.CI;

const nextConfig: NextConfig = {
  compiler: {
    reactRemoveProperties: isCI ? false : { properties: ['^data-pw-id$'] },
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
        hostname: 'cdn.buymeacoffee.com',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
