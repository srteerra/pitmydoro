'use client';

import { Box, Flex, Image, Separator, Text } from '@chakra-ui/react';
import tinycolor from 'tinycolor2';
import { BiLogoGithub } from 'react-icons/bi';
import useSessionStore from '@/stores/Session.store';
import Link from 'next/link';
import NextImage from 'next/image';
import { useTranslations } from 'next-intl';
import useSettingsStore from '@/stores/Settings.store';
import Logo from '../../../../public/images/pitmydoro.webp';
import { BuyMeACoffee } from '@/components/BuyMeACoffee';
import {
  APP_VERSION,
  GITHUB_PROFILE_URL,
  GITHUB_REPO_RELEASES_URL,
  GITHUB_REPO_URL,
} from '@/constants/Site';

export const Footer = () => {
  const t = useTranslations('footer');
  const sessionStatus = useSessionStore((state) => state.status);
  const currentScuderia = useSettingsStore((state) => state.currentScuderia);

  const darkenColor = tinycolor(currentScuderia?.colors?.background?.[sessionStatus])
    .darken(5)
    .toString();

  return (
    <Flex
      as='footer'
      flexDirection='column'
      alignItems='center'
      bgColor={{ base: darkenColor, _dark: 'black' }}
      paddingTop={{ base: 12, md: 14 }}
      paddingBottom={{
        base: 'calc(3rem + var(--cookie-consent-offset, 0px))',
        md: 'calc(3.5rem + var(--cookie-consent-offset, 0px))',
      }}
      paddingX={{ base: 6, md: 4 }}
      gap={7}
    >
      <Text fontSize='sm' fontWeight='bold' color='gray.500'>
        {t.rich('madeWith', {
          author: (chunks) => (
            <Link href={GITHUB_PROFILE_URL} target='_blank' rel='noopener noreferrer'>
              <Text
                as='span'
                fontWeight='bold'
                textDecoration='underline'
                color={{ base: 'gray.600', _dark: 'white' }}
              >
                {chunks}
              </Text>
            </Link>
          ),
        })}
      </Text>

      <BuyMeACoffee />

      <Flex
        alignItems='center'
        gap={{ base: 3, md: 5 }}
        flexWrap='wrap'
        justifyContent='center'
        rowGap={2}
      >
        <Link href='/terms'>
          <Text fontSize='sm' color='gray.500' _hover={{ textDecoration: 'underline' }}>
            {t('terms')}
          </Text>
        </Link>

        <Link href='/privacy'>
          <Text fontSize='sm' color='gray.500' _hover={{ textDecoration: 'underline' }}>
            {t('privacy')}
          </Text>
        </Link>

        <Link href={GITHUB_REPO_URL} target='_blank' rel='noopener noreferrer'>
          <Flex alignItems='center' gap={2}>
            <Box color='gray.500'>
              <BiLogoGithub />
            </Box>
            <Text
              fontSize='sm'
              fontWeight='medium'
              color={{ base: 'gray.500', _dark: 'white' }}
              _hover={{ textDecoration: 'underline' }}
            >
              {t('license')}
            </Text>
          </Flex>
        </Link>

        <Link href={GITHUB_REPO_RELEASES_URL}>
          <Text
            fontSize='sm'
            color='gray.500'
            _hover={{ textDecoration: 'underline' }}
            data-pw-id='footer-version'
          >
            {t('version', { version: APP_VERSION })}
          </Text>
        </Link>
      </Flex>

      <Separator width='full' maxW='720px' opacity={0.25} />

      <Text fontSize='sm' color='gray.500' textAlign='center' maxW='560px'>
        {t('disclaimer')}
      </Text>

      <Image asChild filter='none' alt='Pitmydoro' width='132px' _dark={{ filter: 'invert(1)' }}>
        <NextImage src={Logo} alt='Pitmydoro' priority={false} />
      </Image>
    </Flex>
  );
};
