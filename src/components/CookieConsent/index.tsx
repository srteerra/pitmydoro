'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LuArrowUpRight } from 'react-icons/lu';
import useConsentStore from '@/stores/Consent.store';
import { RippleButton } from '@/components/Pomodoro/components/RippleButton';

export const CookieConsent = () => {
  const t = useTranslations('cookieConsent');
  const status = useConsentStore((state) => state.status);
  const accept = useConsentStore((state) => state.accept);
  const decline = useConsentStore((state) => state.decline);
  const pathname = usePathname();

  const [hydrated, setHydrated] = useState(false);
  const bannerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (useConsentStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }

    return useConsentStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  const visible = hydrated && status === 'pending';

  useEffect(() => {
    if (!visible) return;

    const node = bannerRef.current;
    if (!node) return;

    const apply = () => {
      const offset = `${node.offsetHeight + 32}px`;
      document.documentElement.style.setProperty('--cookie-consent-offset', offset);
      document.body.style.paddingBottom = document.querySelector('footer') ? '' : offset;
    };

    apply();

    const observer = new ResizeObserver(apply);
    observer.observe(node);

    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty('--cookie-consent-offset');
      document.body.style.paddingBottom = '';
    };
  }, [visible, pathname]);

  if (!visible) return null;

  return (
    <Box
      position='fixed'
      bottom={{ base: 4, md: 6 }}
      left='50%'
      transform='translateX(-50%)'
      animation='fadeSlideUpCentered 0.5s ease-out'
      width='calc(100% - 2rem)'
      maxWidth='1040px'
      zIndex={1400}
      role='dialog'
      aria-live='polite'
      aria-label={t('title')}
      data-pw-id='cookie-consent'
      ref={bannerRef}
    >
      <Flex
        direction={{ base: 'column', lg: 'row' }}
        align={{ base: 'stretch', lg: 'center' }}
        justify='space-between'
        gap={{ base: 4, lg: 10 }}
        paddingX={{ base: 5, md: 7 }}
        paddingY={{ base: 5, md: 5 }}
        rounded='2xl'
        borderWidth='1px'
        borderColor={{ base: 'gray.200', _dark: 'whiteAlpha.200' }}
        backgroundColor={{ base: 'white', _dark: 'gray.900' }}
        boxShadow='lg'
      >
        <Box flex='1' minWidth={0}>
          <Text fontSize='md' fontWeight='bold'>
            🍪 {t('title')}
          </Text>

          <Text fontSize='sm' color={{ base: 'gray.600', _dark: 'gray.400' }} marginTop={1}>
            {t('description')}{' '}
            <Link href='/privacy' data-pw-id='cookie-consent-more'>
              <Flex
                as='span'
                display='inline-flex'
                alignItems='center'
                gap={1}
                textDecoration='underline'
                color={{ base: 'gray.800', _dark: 'gray.200' }}
                fontWeight='medium'
              >
                {t('learnMore')}
                <Box as='span' display='inline-flex' opacity={0.6} fontSize='xs'>
                  <LuArrowUpRight />
                </Box>
              </Flex>
            </Link>
          </Text>
        </Box>

        <Flex
          gap={4}
          alignItems='center'
          justifyContent={{ base: 'flex-end', lg: 'flex-start' }}
          flexShrink={0}
        >
          <RippleButton
            buttonColor={'gray.600'}
            spanColor={'gray.500'}
            size='sm'
            onClick={decline}
            data-pw-id='cookie-decline'
          >
            {t('decline')}
          </RippleButton>

          <RippleButton
            buttonColor={'black'}
            spanColor={'gray.800'}
            size='sm'
            onClick={accept}
            data-pw-id='cookie-accept'
          >
            🍪 {t('accept')}
          </RippleButton>
        </Flex>
      </Flex>
    </Box>
  );
};
