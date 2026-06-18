'use client';

import React from 'react';
import { Box, Container, Flex, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import Link from 'next/link';
import { useTranslations } from 'use-intl';
import tinycolor from 'tinycolor2';
import useSessionStore from '@/stores/Session.store';
import useSettingsStore from '@/stores/Settings.store';
import { TiDivider } from '@/components/Layout/WrapSections/components/Divider';
import { jersey15 } from '@/assets/fonts/Jersey';

const TOC = [
  { id: 'championship', titleKey: 'championship.title' },
  { id: 'race-weekend', titleKey: 'weekend.title' },
  { id: 'race-length', titleKey: 'raceLength.title' },
  { id: 'rules', titleKey: 'rules.title' },
  { id: 'race-control', titleKey: 'raceControl.title' },
  { id: 'pit-stops', titleKey: 'pitstops.title' },
  { id: 'tires', titleKey: 'tires.title' },
  { id: 'the-2026-car', titleKey: 'tech.title' },
  { id: 'teams', titleKey: 'teams.title' },
  { id: 'glossary', titleKey: 'glossary.title' },
];

const WEEKEND_STEPS = ['practice', 'qualifying', 'sprint', 'race'];

const POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

const FLAGS = [
  { id: 'green', bg: '#27A03A' },
  { id: 'yellow', bg: '#F7D000' },
  { id: 'doubleYellow', bg: 'repeating-linear-gradient(90deg,#F7D000 0 13px,#D4B400 13px 16px)' },
  { id: 'blue', bg: '#1E6FE0' },
  { id: 'red', bg: '#E10600' },
  { id: 'yellowRed', bg: 'repeating-linear-gradient(45deg,#F7D000 0 9px,#E10600 9px 18px)' },
  { id: 'white', bg: '#F4F4F4' },
  { id: 'black', bg: '#111111' },
  {
    id: 'chequered',
    bg: 'conic-gradient(#111 0 90deg,#fff 0 180deg,#111 0 270deg,#fff 0)',
    size: '16px 16px',
  },
];

const TIRE_INDEX: Record<string, number> = {
  soft: 0,
  medium: 1,
  hard: 2,
  intermediate: 3,
  wet: 4,
};

const TIRES = ['soft', 'medium', 'hard', 'intermediate', 'wet'];

const TEAMS = [
  { id: 'mclaren', color: '#FF8000' },
  { id: 'ferrari', color: '#E8002D' },
  { id: 'redbull', color: '#3671C6' },
  { id: 'mercedes', color: '#27F4D2' },
  { id: 'aston', color: '#229971' },
  { id: 'alpine', color: '#00A1E8' },
  { id: 'williams', color: '#1868DB' },
  { id: 'racingbulls', color: '#6692FF' },
  { id: 'haas', color: '#B6BABD' },
  { id: 'audi', color: '#009682' },
  { id: 'cadillac', color: '#C9A227' },
];

const GLOSSARY = [
  'pole',
  'podium',
  'dnf',
  'dns',
  'boxBox',
  'stint',
  'outInLap',
  'formationLap',
  'undercut',
  'overcut',
  'pitWindow',
  'slipstream',
  'dirtyAir',
  'backmarker',
  'lockUp',
  'graining',
  'marbles',
  'delta',
  'parcFerme',
  'paddock',
  'grandChelem',
];

const TireIcon = ({ id, size = 72 }: { id: string; size?: number }) => (
  <Box
    flexShrink={0}
    aria-hidden
    style={{
      backgroundImage: "url('/images/tires.webp')",
      backgroundSize: `${size * 7}px auto`,
      backgroundPositionX: `-${size * TIRE_INDEX[id]}px`,
      backgroundRepeat: 'no-repeat',
      width: `${size}px`,
      height: `${size}px`,
    }}
  />
);

export const Learn = () => {
  const t = useTranslations('learn');
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

  const SubHeading = ({ children }: { children: React.ReactNode }) => (
    <Text as='h3' fontSize='xl' fontWeight='semibold' mb={1}>
      {children}
    </Text>
  );

  return (
    <Container maxW='4xl' py={{ base: 10, md: 16 }} color={{ base: 'gray.700', _dark: 'gray.200' }}>
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

      <Box
        as='nav'
        aria-label={t('toc.title')}
        mb={{ base: 12, md: 16 }}
        p={6}
        rounded='2xl'
        bg={cardBg}
      >
        <Text
          as='h2'
          fontSize='sm'
          textTransform='uppercase'
          letterSpacing='wide'
          opacity={0.7}
          mb={4}
        >
          {t('toc.title')}
        </Text>
        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={2}>
          {TOC.map((item) => (
            <Link key={item.id} href={`#${item.id}`}>
              <Text
                _hover={{ color: accent, textDecoration: 'underline' }}
                fontWeight='medium'
                transition='color 0.2s'
              >
                {t(item.titleKey)}
              </Text>
            </Link>
          ))}
        </SimpleGrid>
      </Box>

      <VStack as='article' align='stretch' gap={{ base: 14, md: 20 }}>
        <Box as='section'>
          <Heading id='championship'>{t('championship.title')}</Heading>
          <Text mb={6}>{t('championship.body')}</Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
            <Box p={5} rounded='xl' bg={cardBg}>
              <SubHeading>{t('championship.drivers.title')}</SubHeading>
              <Text opacity={0.85}>{t('championship.drivers.body')}</Text>
            </Box>
            <Box p={5} rounded='xl' bg={cardBg}>
              <SubHeading>{t('championship.constructors.title')}</SubHeading>
              <Text opacity={0.85}>{t('championship.constructors.body')}</Text>
            </Box>
          </SimpleGrid>
        </Box>

        <Box as='section'>
          <Heading id='race-weekend'>{t('weekend.title')}</Heading>
          <Text mb={6}>{t('weekend.intro')}</Text>
          <VStack align='stretch' gap={4}>
            {WEEKEND_STEPS.map((step, index) => (
              <Flex key={step} gap={4} align='flex-start'>
                <Flex
                  flexShrink={0}
                  align='center'
                  justify='center'
                  w='40px'
                  h='40px'
                  rounded='full'
                  fontWeight='bold'
                  bg={accent}
                  color='white'
                  className={jersey15.className}
                >
                  {index + 1}
                </Flex>
                <Box>
                  <SubHeading>{t(`weekend.${step}.title`)}</SubHeading>
                  <Text opacity={0.85}>{t(`weekend.${step}.body`)}</Text>
                </Box>
              </Flex>
            ))}
          </VStack>
        </Box>

        <Box as='section'>
          <Heading id='race-length'>{t('raceLength.title')}</Heading>
          <Text>{t('raceLength.body')}</Text>
        </Box>

        <Box as='section'>
          <Heading id='rules'>{t('rules.title')}</Heading>

          <SubHeading>{t('rules.points.title')}</SubHeading>
          <Text opacity={0.85} mb={4}>
            {t('rules.points.body')}
          </Text>
          <Flex wrap='wrap' gap={2} mb={3}>
            {POINTS.map((points, index) => (
              <Flex key={index} gap={2} align='center' px={3} py={1} rounded='full' bg={cardBg}>
                <Text fontSize='sm' opacity={0.6}>
                  P{index + 1}
                </Text>
                <Text fontWeight='bold'>{points}</Text>
              </Flex>
            ))}
          </Flex>
          <Text fontSize='sm' opacity={0.7} mb={10}>
            {t('rules.fastestLap')}
          </Text>

          <SubHeading>{t('rules.flags.title')}</SubHeading>
          <Text opacity={0.85} mb={6}>
            {t('rules.flags.intro')}
          </Text>
          <SimpleGrid columns={{ base: 2, sm: 3 }} gap={4} mb={10}>
            {FLAGS.map((flag) => (
              <Box
                key={flag.id}
                p={4}
                rounded='xl'
                bg={cardBg}
                role='group'
                cursor='default'
                transition='transform 0.2s, box-shadow 0.2s'
                _hover={{ transform: 'translateY(-3px)', boxShadow: 'md' }}
              >
                <Box
                  h='52px'
                  rounded='md'
                  mb={3}
                  borderWidth='1px'
                  borderColor={{ base: 'blackAlpha.200', _dark: 'whiteAlpha.300' }}
                  transformOrigin='left center'
                  transition='transform 0.25s ease'
                  _groupHover={{ transform: 'rotate(-2deg) scale(1.04)' }}
                  style={{ background: flag.bg, backgroundSize: flag.size }}
                />
                <Text fontWeight='bold' fontSize='sm'>
                  {t(`rules.flags.items.${flag.id}.name`)}
                </Text>
                <Text fontSize='xs' opacity={0.75}>
                  {t(`rules.flags.items.${flag.id}.meaning`)}
                </Text>
              </Box>
            ))}
          </SimpleGrid>

          <SubHeading>{t('rules.penalties.title')}</SubHeading>
          <Text opacity={0.85}>{t('rules.penalties.body')}</Text>
        </Box>

        <Box as='section'>
          <Heading id='race-control'>{t('raceControl.title')}</Heading>
          <Text mb={6}>{t('raceControl.intro')}</Text>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
            {['safetyCar', 'vsc', 'intervals'].map((item) => (
              <Box key={item} p={5} rounded='xl' bg={cardBg}>
                <SubHeading>{t(`raceControl.${item}.title`)}</SubHeading>
                <Text opacity={0.85} fontSize='sm'>
                  {t(`raceControl.${item}.body`)}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        <Box as='section'>
          <Heading id='pit-stops'>{t('pitstops.title')}</Heading>
          <Text mb={4}>{t('pitstops.body')}</Text>
          <Box
            borderLeftWidth='4px'
            borderLeftColor={accent}
            pl={4}
            py={1}
            fontStyle='italic'
            opacity={0.9}
          >
            {t('pitstops.why')}
          </Box>
        </Box>

        <Box as='section'>
          <Heading id='tires'>{t('tires.title')}</Heading>
          <Text mb={6}>{t('tires.intro')}</Text>
          <VStack align='stretch' gap={3}>
            {TIRES.map((tire) => (
              <Flex
                key={tire}
                gap={4}
                align='center'
                p={4}
                rounded='xl'
                bg={cardBg}
                direction={{ base: 'column', sm: 'row' }}
                textAlign={{ base: 'center', sm: 'left' }}
              >
                <TireIcon id={tire} />
                <Box flex='1'>
                  <Text fontWeight='bold' fontSize='lg'>
                    {t(`tires.items.${tire}.name`)}
                  </Text>
                  <Text fontSize='sm' opacity={0.7} mb={2}>
                    {t(`tires.items.${tire}.use`)}
                  </Text>
                  <SimpleGrid columns={{ base: 1, sm: 3 }} gap={2} pt={3}>
                    <Box>
                      <Text fontSize='xs' textTransform='uppercase' opacity={0.5}>
                        {t('tires.headers.grip')}
                      </Text>
                      <Text fontSize='sm'>{t(`tires.items.${tire}.grip`)}</Text>
                    </Box>
                    <Box>
                      <Text fontSize='xs' textTransform='uppercase' opacity={0.5}>
                        {t('tires.headers.durability')}
                      </Text>
                      <Text fontSize='sm'>{t(`tires.items.${tire}.durability`)}</Text>
                    </Box>
                    <Box>
                      <Text fontSize='xs' textTransform='uppercase' opacity={0.5}>
                        {t('tires.headers.life')}
                      </Text>
                      <Text fontSize='sm' fontWeight='medium'>
                        {t(`tires.items.${tire}.life`)}
                      </Text>
                    </Box>
                  </SimpleGrid>
                </Box>
              </Flex>
            ))}
          </VStack>
        </Box>

        <Box as='section'>
          <Heading id='the-2026-car'>{t('tech.title')}</Heading>
          <Text mb={6}>{t('tech.intro')}</Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
            {['activeAero', 'overtake'].map((item) => (
              <Box key={item} p={5} rounded='xl' bg={cardBg}>
                <SubHeading>{t(`tech.${item}.title`)}</SubHeading>
                <Text opacity={0.85}>{t(`tech.${item}.body`)}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        <Box as='section'>
          <Heading id='teams'>{t('teams.title')}</Heading>
          <Text mb={6}>{t('teams.body')}</Text>

          <Box p={5} rounded='xl' bg={cardBg} mb={8}>
            <SubHeading>{t('teams.season2026.title')}</SubHeading>
            <Text opacity={0.85}>{t('teams.season2026.body')}</Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} mb={8}>
            <Box p={5} rounded='xl' bg={cardBg}>
              <SubHeading>{t('teams.roster.title')}</SubHeading>
              <Text opacity={0.85}>{t('teams.roster.body')}</Text>
            </Box>
            <Box p={5} rounded='xl' bg={cardBg}>
              <SubHeading>{t('teams.reserve.title')}</SubHeading>
              <Text opacity={0.85}>{t('teams.reserve.body')}</Text>
            </Box>
          </SimpleGrid>

          <SubHeading>{t('teams.grid.title')}</SubHeading>
          <Text fontSize='sm' opacity={0.65} mb={5}>
            {t('teams.grid.note')}
          </Text>
          <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
            {TEAMS.map((team) => (
              <Flex
                key={team.id}
                align='center'
                gap={4}
                p={4}
                rounded='xl'
                bg={cardBg}
                borderLeftWidth='5px'
                borderLeftColor={team.color}
              >
                <Box w='10px' h='10px' rounded='full' bg={team.color} flexShrink={0} />
                <Box>
                  <Text fontWeight='bold'>{t(`teams.grid.items.${team.id}.name`)}</Text>
                  <Text fontSize='sm' opacity={0.8}>
                    {t(`teams.grid.items.${team.id}.drivers`)}
                  </Text>
                </Box>
              </Flex>
            ))}
          </SimpleGrid>
        </Box>

        <Box as='section'>
          <Heading id='glossary'>{t('glossary.title')}</Heading>
          <Text mb={6}>{t('glossary.intro')}</Text>
          <SimpleGrid as='dl' columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
            {GLOSSARY.map((term) => (
              <Box
                key={term}
                p={4}
                rounded='xl'
                bg={cardBg}
                borderTopWidth='3px'
                borderTopColor={accent}
              >
                <Text as='dt' fontWeight='bold' color={accent} mb={1}>
                  {t(`glossary.terms.${term}.term`)}
                </Text>
                <Text as='dd' fontSize='sm' opacity={0.85}>
                  {t(`glossary.terms.${term}.def`)}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </VStack>

      <Box
        as='section'
        mt={{ base: 16, md: 24 }}
        p={{ base: 8, md: 12 }}
        rounded='3xl'
        textAlign='center'
        bg={cardBg}
      >
        <Text
          as='h2'
          fontSize={{ base: '2xl', md: '3xl' }}
          fontWeight='bold'
          className={jersey15.className}
        >
          {t('cta.title')}
        </Text>
        <Text mt={3} mb={6} opacity={0.85} maxW='2xl' mx='auto'>
          {t('cta.body')}
        </Text>
        <Link href='/'>
          <Box
            as='span'
            display='inline-block'
            px={8}
            py={3}
            rounded='full'
            fontWeight='semibold'
            color='white'
            bg={accent}
            _hover={{ opacity: 0.9 }}
            transition='opacity 0.2s'
          >
            {t('cta.button')}
          </Box>
        </Link>
      </Box>
    </Container>
  );
};
