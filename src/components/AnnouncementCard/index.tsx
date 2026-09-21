'use client';

import React, { useEffect, useState } from 'react';
import { Badge, Box, Button, Flex, IconButton, Link, Text, VStack } from '@chakra-ui/react';
import { IoClose, IoMegaphoneOutline } from 'react-icons/io5';
import { BiLogoGithub } from 'react-icons/bi';
import tinycolor from 'tinycolor2';
import { useTranslations } from 'next-intl';
import useSessionStore from '@/stores/Session.store';
import useSettingsStore from '@/stores/Settings.store';
import useConsentStore, { hasCookieConsent } from '@/stores/Consent.store';

const OWNER = 'srteerra';
const REPO = 'pitmydoro';
const COMMUNITY_URL = `https://github.com/${OWNER}/${REPO}/discussions`;
const CACHE_KEY = 'pmd-release-cache';
const CACHE_TTL_MS = 60 * 60 * 1000;

interface Release {
  tag: string;
  name: string;
  url: string;
  items: string[];
}

const dismissedKey = (tag: string) => `pmd-announcement-${tag}`;

const dismissalStore = (): Storage | null => {
  try {
    return hasCookieConsent() ? localStorage : sessionStorage;
  } catch {
    return null;
  }
};

const isDismissed = (tag: string) => {
  try {
    return dismissalStore()?.getItem(dismissedKey(tag)) === 'dismissed';
  } catch {
    return false;
  }
};

const markDismissed = (tag: string) => {
  try {
    dismissalStore()?.setItem(dismissedKey(tag), 'dismissed');
  } catch {
    return;
  }
};

const readCache = (): Release | null => {
  if (!hasCookieConsent()) return null;

  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, release } = JSON.parse(raw) as { ts: number; release: Release };
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    return release;
  } catch {
    return null;
  }
};

const writeCache = (release: Release) => {
  if (!hasCookieConsent()) return;

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), release }));
  } catch {
    return;
  }
};

const cleanLine = (line: string) =>
  line
    .replace(/^[-*]\s+/, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .trim();

const parseRelease = (data: {
  tag_name?: string;
  name?: string;
  html_url?: string;
  body?: string;
}): Release => {
  const lines = (data.body ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const items = lines
    .filter((line) => /^[-*]\s+/.test(line))
    .map(cleanLine)
    .filter(Boolean)
    .slice(0, 5);

  return {
    tag: data.tag_name ?? '',
    name: data.name || data.tag_name || '',
    url: data.html_url ?? `https://github.com/${OWNER}/${REPO}/releases`,
    items,
  };
};

export const AnnouncementCard = () => {
  const t = useTranslations('announcement');
  const sessionStatus = useSessionStore((state) => state.status);
  const currentScuderia = useSettingsStore((state) => state.currentScuderia);

  const [release, setRelease] = useState<Release | null>(null);
  const [open, setOpen] = useState(false);
  const consentStatus = useConsentStore((state) => state.status);

  useEffect(() => {
    if (consentStatus === 'pending') return;

    const apply = (parsed: Release) => {
      if (!parsed.tag) return;
      setRelease(parsed);
      if (!isDismissed(parsed.tag)) {
        setOpen(true);
      }
    };

    const cached = readCache();
    if (cached) {
      apply(cached);
      return;
    }

    fetch(`https://api.github.com/repos/${OWNER}/${REPO}/releases/latest`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => {
        const parsed = parseRelease(data);
        if (!parsed.tag) return;
        writeCache(parsed);
        apply(parsed);
      })
      .catch(() => undefined);
  }, [consentStatus]);

  if (!open || !release || consentStatus === 'pending') return null;

  const handleClose = () => {
    markDismissed(release.tag);
    setOpen(false);
  };

  const accent = tinycolor(currentScuderia?.colors?.background?.[sessionStatus])
    .darken(50)
    .toString();

  return (
    <Box
      position='fixed'
      bottom={{ base: 4, md: 6 }}
      right={{ base: 4, md: 6 }}
      animation='fadeSlideUp 0.5s ease-out'
      zIndex={1000}
      maxW={{ base: 'calc(100vw - 2rem)', md: '320px' }}
      w='full'
      p={4}
      rounded='2xl'
      shadow='lg'
      borderWidth='1px'
      borderColor={{ base: 'blackAlpha.200', _dark: 'whiteAlpha.200' }}
      bg={{ base: 'white', _dark: 'dark.200' }}
    >
      <Flex justify='space-between' align='center' mb={2}>
        <Flex align='center' gap={2}>
          <Box color={accent} fontSize='lg'>
            <IoMegaphoneOutline />
          </Box>
          <Text fontWeight='bold' fontSize='sm'>
            {t('title')}
          </Text>
          <Badge rounded='full' bg={accent} color='white' px={2}>
            {release.tag}
          </Badge>
        </Flex>

        <IconButton
          aria-label={t('close')}
          size='xs'
          variant='ghost'
          rounded='full'
          onClick={handleClose}
        >
          <IoClose />
        </IconButton>
      </Flex>

      {release.items.length > 0 ? (
        <VStack align='stretch' gap={1} mb={3}>
          {release.items.map((item, index) => (
            <Flex key={index} align='flex-start' gap={2}>
              <Box mt='6px' w='6px' h='6px' rounded='full' bg={accent} flexShrink={0} />
              <Text fontSize='sm'>{item}</Text>
            </Flex>
          ))}
        </VStack>
      ) : (
        <Text fontSize='sm' mb={3}>
          {release.name}
        </Text>
      )}

      <Link
        href={release.url}
        target='_blank'
        rel='noopener noreferrer'
        fontSize='xs'
        color={accent}
        mb={3}
        display='inline-block'
      >
        {t('viewRelease')}
      </Link>

      <Button
        asChild
        w='full'
        size='sm'
        rounded='full'
        bg={accent}
        color='white'
        gap={2}
        _hover={{ opacity: 0.9 }}
      >
        <a href={COMMUNITY_URL} target='_blank' rel='noopener noreferrer'>
          <BiLogoGithub />
          {t('community')}
        </a>
      </Button>
    </Box>
  );
};
