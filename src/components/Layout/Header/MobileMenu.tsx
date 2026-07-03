'use client';

import React from 'react';
import { Flex, HStack, Text, VStack } from '@chakra-ui/react';
import NextLink from 'next/link';
import { LuBookText } from 'react-icons/lu';
import { ToggleThemeMode } from '@/components/Layout/Toggles/ThemeMode';
import { TogglePomodoroMode } from '@/components/Layout/Toggles/PomodoroMode';
import GitHubStars from '@/components/GithubStars';
import { useTranslations } from 'use-intl';
import { useRouter } from 'next/navigation';
import { useTimerGuard } from '@/hooks/useTimerGuard';

export const MobileMenu = ({ onClose }: { onClose: () => void }) => {
  const t = useTranslations('header');
  const router = useRouter();
  const { confirmInterruptIfRunning } = useTimerGuard();

  const handleNav = async (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    if (!(await confirmInterruptIfRunning())) return;
    onClose();
    router.push(href);
  };

  return (
    <Flex direction='column' height='full' justifyContent='space-between' gap={6}>
      <VStack align='stretch' gap={5}>
        <NextLink
          href='/learn'
          aria-label='Learn Formula 1'
          onClick={(e) => handleNav(e, '/learn')}
        >
          <HStack
            gap={2}
            fontWeight='medium'
            bgColor={{ base: 'gray.100', _hover: 'gray.200', _dark: 'gray.700' }}
            padding={4}
            rounded='xl'
            color={{ base: 'gray.700', _hover: 'gray.900', _dark: 'gray.200' }}
          >
            <LuBookText />
            <Text>{t('learn')}</Text>
          </HStack>
        </NextLink>
      </VStack>

      <VStack gap={4} align='center' mb={32}>
        <GitHubStars />

        <HStack gap={2} justifyContent='center'>
          <TogglePomodoroMode />
          <ToggleThemeMode />
        </HStack>
      </VStack>
    </Flex>
  );
};
