'use client';

import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Container,
  Flex,
  Link as ChakraLink,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import tinycolor from 'tinycolor2';
import { BiLogoGithub, BiLogoInstagram } from 'react-icons/bi';
import useSessionStore from '@/stores/Session.store';
import useSettingsStore from '@/stores/Settings.store';
import { TiDivider } from '@/components/Layout/WrapSections/components/Divider';
import { ContributorsMarquee } from '@/components/Credits/ContributorsMarquee';
import { jersey15 } from '@/assets/fonts/Jersey';
import { ART_CREDITS, CreditLink, SOUND_CREDITS } from '@/constants/Credits';
import { GITHUB_REPO_CONTRIBUTING_URL } from '@/constants/Site';

const LINK_ICONS: Record<CreditLink['type'], React.ElementType> = {
  instagram: BiLogoInstagram,
  github: BiLogoGithub,
  website: BiLogoGithub,
};

export const Credits = () => {
  const t = useTranslations('credits');
  const sessionStatus = useSessionStore((state) => state.status);
  const currentScuderia = useSettingsStore((state) => state.currentScuderia);

  const accent = tinycolor(currentScuderia?.colors?.background?.[sessionStatus])
    .darken(50)
    .toString();

  const cardBg = { base: 'blackAlpha.50', _dark: 'whiteAlpha.100' };

  const Heading = ({ id, children }: { id: string; children: React.ReactNode }) => (
    <Box id={id} scrollMarginTop='90px'>
      <Text
        as='h2'
        fontSize={{ base: '3xl', md: '4xl' }}
        fontWeight='bold'
        className={jersey15.className}
      >
        {children}
      </Text>
      <TiDivider width='48px' height='4px' my='16px' color={accent} />
    </Box>
  );

  return (
    <Box as='main' color={{ base: 'gray.700', _dark: 'gray.200' }}>
      <Container maxW='4xl' py={{ base: 10, md: 16 }}>
        <VStack as='header' align='flex-start' gap={4} mb={{ base: 12, md: 16 }}>
          <Text
            as='h1'
            fontSize={{ base: '4xl', md: '6xl' }}
            lineHeight={1.05}
            fontWeight='bold'
            className={jersey15.className}
          >
            {t('hero.title')}
          </Text>

          <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight='medium'>
            {t('hero.subtitle')}
          </Text>

          <Box
            borderLeftWidth='4px'
            borderLeftColor={accent}
            pl={4}
            py={1}
            fontStyle='italic'
            opacity={0.9}
          >
            <Text opacity={0.85}>{t('hero.intro')}</Text>
          </Box>
        </VStack>

        <VStack align='stretch' gap={{ base: 14, md: 20 }}>
          <Box as='section'>
            <Heading id='sounds'>{t('sounds.title')}</Heading>

            <Text mb={6}>{t('sounds.intro')}</Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              {SOUND_CREDITS.map((credit) => (
                <Flex
                  key={credit.id}
                  direction='column'
                  gap={2}
                  p={5}
                  rounded='xl'
                  bg={cardBg}
                  height='full'
                >
                  <Flex align='baseline' justify='space-between' gap={3}>
                    <Text fontWeight='semibold'>{t(`tracks.${credit.trackKey}`)}</Text>

                    <Text fontSize='xs' fontFamily='mono' opacity={0.6}>
                      {credit.file}
                    </Text>
                  </Flex>

                  <Text fontSize='sm' opacity={0.85}>
                    {t.rich('sounds.attribution', {
                      author: credit.author,
                      source: credit.source,
                      authorLink: (chunks) => (
                        <ChakraLink
                          href={credit.authorUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          fontWeight='bold'
                          textDecoration='underline'
                        >
                          {chunks}
                        </ChakraLink>
                      ),
                      sourceLink: (chunks) => (
                        <ChakraLink
                          href={credit.sourceUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          fontWeight='bold'
                          textDecoration='underline'
                        >
                          {chunks}
                        </ChakraLink>
                      ),
                    })}
                  </Text>
                </Flex>
              ))}
            </SimpleGrid>
          </Box>

          <Box as='section'>
            <Heading id='art'>{t('art.title')}</Heading>

            <Text mb={6}>{t('art.intro')}</Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              {ART_CREDITS.map((person) => (
                <Flex
                  key={person.id}
                  direction='column'
                  align='center'
                  textAlign='center'
                  gap={3}
                  p={6}
                  rounded='2xl'
                  bg={cardBg}
                >
                  <Avatar.Root
                    size='2xl'
                    borderRadius='full'
                    borderWidth='3px'
                    borderColor={accent}
                  >
                    <Avatar.Fallback name={person.name} />
                    <Avatar.Image src={person.avatar} alt={person.name} />
                  </Avatar.Root>

                  <Box>
                    <Text fontSize='lg' fontWeight='bold'>
                      {person.name}
                    </Text>

                    <Text fontSize='sm' opacity={0.6}>
                      {person.handle}
                    </Text>
                  </Box>

                  <Text fontSize='sm' opacity={0.85}>
                    {person.work}
                  </Text>

                  <Flex gap={2} wrap='wrap' justify='center'>
                    {person.links.map((link) => {
                      const Icon = LINK_ICONS[link.type];

                      return (
                        <Button
                          key={link.id}
                          asChild
                          size='sm'
                          variant='outline'
                          borderRadius='full'
                        >
                          <a href={link.url} target='_blank' rel='noopener noreferrer'>
                            <Icon />
                            {t(`links.${link.type}`)}
                          </a>
                        </Button>
                      );
                    })}
                  </Flex>
                </Flex>
              ))}
            </SimpleGrid>
          </Box>

          <Box as='section'>
            <Heading id='contributors'>{t('contributors.title')}</Heading>

            <Text>{t('contributors.intro')}</Text>
          </Box>
        </VStack>
      </Container>

      <Box marginY={{ base: 4, md: 6 }}>
        <ContributorsMarquee />
      </Box>

      <Container maxW='4xl' pb={{ base: 14, md: 20 }}>
        <Flex direction='column' align='center' gap={3}>
          <Button asChild size='lg' borderRadius='full' bgColor={accent} color='white'>
            <a href={GITHUB_REPO_CONTRIBUTING_URL} target='_blank' rel='noopener noreferrer'>
              <BiLogoGithub />
              {t('contribute.cta')}
            </a>
          </Button>

          <Text fontSize='sm' opacity={0.7} textAlign='center'>
            {t('contribute.hint')}
          </Text>
        </Flex>
      </Container>
    </Box>
  );
};
