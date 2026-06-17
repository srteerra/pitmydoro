'use client';

import { Center, Flex, Text, VStack } from '@chakra-ui/react';
import tinycolor from 'tinycolor2';
import { BiLogoGithub } from 'react-icons/bi';
import useSessionStore from '@/stores/Session.store';
import Link from 'next/link';
import { useTranslations } from 'use-intl';
import useSettingsStore from '@/stores/Settings.store';

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
      bgColor={{ base: darkenColor, _dark: 'gray.950' }}
      paddingY={12}
      gap={4}
    >
      <Center>
        <Text fontSize='sm' color='gray.500'>
          {t('disclaimer')}
        </Text>
      </Center>

      <VStack>
        <Text fontSize='sm' fontWeight='bold' color='gray.500'>
          {t('madeWith')}
        </Text>

        <Flex alignItems='center' gap={2} marginTop={3}>
          <BiLogoGithub />
          <Link
            className={'cursor-pointer link underline'}
            target={'_blank'}
            href={'https://github.com/srteerra/pitmydoro'}
          >
            <Text fontSize='sm' fontWeight='medium' color={{ base: 'gray.500', _dark: 'white' }}>
              {t('license')}
            </Text>
          </Link>
        </Flex>
      </VStack>
    </Flex>
  );
};
