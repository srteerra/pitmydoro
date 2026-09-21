'use client';

import React, { useEffect, useState } from 'react';
import { Avatar, Flex, Link as ChakraLink, Marquee, SkeletonCircle, Text } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { Tooltip } from '@/components/ui/tooltip';
import useSessionStore from '@/stores/Session.store';
import useSettingsStore from '@/stores/Settings.store';
import { GITHUB_CONTRIBUTORS_API_URL } from '@/constants/Site';

interface Contributor {
  id: number;
  login: string;
  avatarUrl: string;
  profileUrl: string;
  contributions: number;
}

const SKELETON_COUNT = 8;

export const ContributorsMarquee = () => {
  const t = useTranslations('credits');
  const sessionStatus = useSessionStore((state) => state.status);
  const currentScuderia = useSettingsStore((state) => state.currentScuderia);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetch(`${GITHUB_CONTRIBUTORS_API_URL}?per_page=100`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!active) return;

        setContributors(
          Array.isArray(data)
            ? data
                .filter((item) => item?.type !== 'Bot')
                .map((item) => ({
                  id: item.id,
                  login: item.login,
                  avatarUrl: item.avatar_url,
                  profileUrl: item.html_url,
                  contributions: item.contributions ?? 0,
                }))
            : []
        );
      })
      .catch(() => active && setContributors([]))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <Flex gap={6} justifyContent='center' paddingY={4} overflow='hidden'>
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <SkeletonCircle key={index} size='64px' flexShrink={0} />
        ))}
      </Flex>
    );
  }

  if (!contributors.length) {
    return (
      <Text fontSize='sm' textAlign='center' opacity={0.7}>
        {t('contributors.empty')}
      </Text>
    );
  }

  return (
    <Marquee.Root
      autoFill
      pauseOnInteraction
      speed={35}
      spacing='2.5rem'
      translations={{ root: t('contributors.marqueeLabel') }}
      css={{
        '--marquee-edge-color': {
          base: currentScuderia?.colors?.background?.[sessionStatus] ?? '{colors.background.light}',
          _dark: '{colors.background.dark}',
        },
      }}
    >
      <Marquee.Viewport paddingY={4}>
        <Marquee.Content>
          {contributors.map((contributor) => (
            <Marquee.Item key={contributor.id}>
              <Tooltip
                content={t('contributors.tooltip', {
                  login: contributor.login,
                  count: contributor.contributions,
                })}
              >
                <ChakraLink
                  href={contributor.profileUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  display='block'
                  borderRadius='full'
                  transition='transform 0.2s'
                  _hover={{ transform: 'scale(1.08)' }}
                >
                  <Avatar.Root size='xl' borderRadius='full'>
                    <Avatar.Fallback name={contributor.login} />
                    <Avatar.Image src={contributor.avatarUrl} alt={contributor.login} />
                  </Avatar.Root>
                </ChakraLink>
              </Tooltip>
            </Marquee.Item>
          ))}
        </Marquee.Content>
      </Marquee.Viewport>

      <Marquee.Edge side='start' />
      <Marquee.Edge side='end' />
    </Marquee.Root>
  );
};
