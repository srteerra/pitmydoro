'use client';

import { Box, Flex, Grid, GridItem, Image, Text } from '@chakra-ui/react';
import React from 'react';
import { useTranslations } from 'use-intl';
import { TiDivider } from '@/components/Layout/WrapSections/components/Divider';
import tinycolor from 'tinycolor2';
import useSessionStore from '@/stores/Session.store';
import { jersey15 } from '@/assets/fonts/Jersey';
import Link from 'next/link';
import { useColorModeValue } from '@/components/ui/color-mode';
import useSettingsStore from '@/stores/Settings.store';

export const About = () => {
  const sessionStatus = useSessionStore((state) => state.status);
  const currentScuderia = useSettingsStore((state) => state.currentScuderia);
  const darkenColor = tinycolor(currentScuderia?.colors?.background?.[sessionStatus])
    .darken(50)
    .toString();

  const t = useTranslations('sections.about');
  const steps = Array.from({ length: 8 }, (_, i) => i + 1);
  const filter = useColorModeValue(
    'contrast(100%) brightness(100%)',
    'contrast(140%) brightness(150%) drop-shadow(0 0 4px rgba(255,255,255,0.3))'
  );

  return (
    <Grid
      templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
      templateRows={{ base: 'repeat(3, auto)', lg: 'repeat(3, 1fr)' }}
      gap={{ base: 10, lg: 24 }}
    >
      <GridItem colSpan={{ base: 2, lg: 1 }} rowStart={{ base: 2, lg: 1 }}>
        <Flex direction={{ base: 'column', lg: 'row' }} align='flex-start' gap={6}>
          <Box>
            <Text as={'h2'} fontSize='3xl' fontWeight='semibold' className={jersey15.className}>
              {t('title')}
            </Text>

            <TiDivider width='5%' height={'4px'} my={'16px'} color={darkenColor} />

            <Text as={'p'}>
              {t.rich('description', {
                strong: (chunks) => <strong>{chunks}</strong>,
                br: () => <br />,
              })}
            </Text>
          </Box>
        </Flex>
      </GridItem>

      <GridItem
        rowStart={{ base: 1, lg: 1 }}
        colStart={{ base: 1, lg: 2 }}
        colSpan={{ base: 2, lg: 1 }}
      >
        <Flex justifyContent={{ base: 'center', lg: 'flex-end' }}>
          <Image
            src='/images/clock.webp'
            alt='Pomodoro'
            width={300}
            height={300}
            objectFit='contain'
            style={{ filter }}
          />
        </Flex>
      </GridItem>

      <GridItem rowStart={{ base: 3, lg: 2 }} colStart={1} colSpan={{ base: 2, lg: 1 }}>
        <Flex justifyContent={{ base: 'center', lg: 'flex-start' }}>
          <Image
            src='/images/tasks.webp'
            alt='Pomodoro'
            width={300}
            height={300}
            objectFit='contain'
            style={{ filter }}
          />
        </Flex>
      </GridItem>

      <GridItem
        rowStart={{ base: 4, lg: 2 }}
        colStart={{ base: 1, lg: 2 }}
        colSpan={{ base: 2, lg: 1 }}
      >
        <Flex
          direction={{ base: 'column', lg: 'row' }}
          align='center'
          m={0}
          textAlign={{ base: 'left', lg: 'right' }}
          justifyContent={'flex-end'}
          gap={6}
        >
          <Box>
            <Text as='h2' fontSize='3xl' fontWeight='bold' className={jersey15.className}>
              {t('title2')}
            </Text>

            <Flex justifyContent={{ base: 'flex-start', lg: 'flex-end' }}>
              <TiDivider width='5%' height={'4px'} my={'10px'} color={darkenColor} />
            </Flex>

            <Text as={'p'}>
              {t.rich('description2', {
                strong: (chunks) => <strong>{chunks}</strong>,
                small: (chunks) => (
                  <Text as={'small'} opacity={0.7}>
                    {chunks}
                  </Text>
                ),
                wiki: (chunks) => (
                  <Link
                    style={{ textDecoration: 'underline' }}
                    href={'https://en.wikipedia.org/wiki/Pomodoro_Technique'}
                    target={'_blank'}
                    rel='noopener noreferrer'
                  >
                    <strong>{chunks}</strong>
                  </Link>
                ),
                br: () => <br />,
              })}
            </Text>
          </Box>
        </Flex>
      </GridItem>

      <GridItem rowStart={{ base: 6, lg: 3 }} colStart={1} colSpan={{ base: 2, lg: 1 }}>
        <Flex
          direction={{ base: 'column', lg: 'row' }}
          align='flex-start'
          textAlign={'start'}
          justifyContent={'flex-start'}
          gap={6}
        >
          <Box>
            <Text as='h2' fontSize='3xl' fontWeight='bold' className={jersey15.className}>
              {t('title3')}
            </Text>

            <Flex justifyContent={'flex-start'}>
              <TiDivider width='5%' height={'4px'} my={'15px'} color={darkenColor} />
            </Flex>

            <Box as='ol' pl={0} style={{ listStyle: 'none' }}>
              {steps.map((step) => {
                const stepText = t(`list.${step}`);

                return (
                  <Flex key={step} mb={3} align='flex-start'>
                    <Box as='span' fontWeight='bold' minW='30px'>
                      {step}.
                    </Box>

                    <Text as={'p'}>{stepText}</Text>
                  </Flex>
                );
              })}
            </Box>
          </Box>
        </Flex>
      </GridItem>

      <GridItem
        rowStart={{ base: 5, lg: 3 }}
        colStart={{ base: 1, lg: 2 }}
        colSpan={{ base: 2, lg: 1 }}
      >
        <Flex justifyContent={{ base: 'center', lg: 'flex-end' }}>
          <Image
            src='/images/check.webp'
            alt='Pomodoro'
            width={400}
            height={400}
            objectFit='contain'
            opacity={{ base: 0.7, _dark: 1 }}
            style={{ filter }}
          />
        </Flex>
      </GridItem>

      <GridItem rowStart={{ base: 7, lg: 4 }} colStart={1} colSpan={{ base: 2, lg: 2 }} my={20}>
        <Flex
          flexDirection={'column'}
          justifyContent={'center'}
          alignItems={'center'}
          textAlign={'center'}
          gap={4}
        >
          <Text as='h2' fontSize='3xl' fontWeight='bold' className={jersey15.className}>
            {t('nonF1.title')}
          </Text>

          <Text as={'p'} w={{ base: '100%', lg: '60%' }}>
            {t.rich('nonF1.description', {
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </Text>

          <Text as={'p'} w={{ base: '100%', lg: '60%' }} fontSize={'sm'} color={'gray.500'}>
            {t.rich('nonF1.description2', {
              f1Blog: (chunks) => (
                <Link href={'/learn'} rel='noopener noreferrer'>
                  <strong>{chunks}</strong>
                </Link>
              ),
            })}
          </Text>
        </Flex>
      </GridItem>
    </Grid>
  );
};
