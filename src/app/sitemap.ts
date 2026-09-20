import { MetadataRoute } from 'next';
import { SITE_URL } from '@/constants/Site';

const routes: { path: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'yearly' }[] =
  [
    { path: '', priority: 1, changeFrequency: 'daily' },
    { path: '/leaderboard', priority: 0.9, changeFrequency: 'daily' },
    { path: '/learn', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/credits', priority: 0.4, changeFrequency: 'weekly' },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
  ];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
