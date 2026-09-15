import { Metadata } from 'next';
import { PublicProfileView } from '@/components/Profile/PublicProfileView';
import { buildMetadata } from '@/utils/seo.utils';
import { SITE_NAME } from '@/constants/Site';

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const name = decodeURIComponent(username);

  return buildMetadata({
    title: `@${name}`,
    description: `Pomodoro stats and activity for @${name} on ${SITE_NAME}.`,
    path: `/profile/${encodeURIComponent(name)}`,
    noIndex: true,
  });
}

export default function PublicProfilePage() {
  return <PublicProfileView />;
}
