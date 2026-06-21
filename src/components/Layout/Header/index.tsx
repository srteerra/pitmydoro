'use client';

import { ToggleThemeMode } from '@/components/Layout/Toggles/ThemeMode';
import { Box, Center, Grid, GridItem, HStack, IconButton, Image } from '@chakra-ui/react';
import React from 'react';
import NextImage from 'next/image';
import Logo from '../../../../public/images/pitmydoro.webp';
import { LocaleSwitch } from '@/components/Layout/Toggles/LocaleSwitch';
import Link from 'next/link';
import { AuthModal } from '@/components/Auth/AuthModal';
import GitHubStars from '@/components/GithubStars';
import { LuBookText } from 'react-icons/lu';
import { TogglePomodoroMode } from '@/components/Layout/Toggles/PomodoroMode';
import { Tooltip } from '@/components/ui/tooltip';
import { useTranslations } from 'use-intl';

export const Header = () => {
  const t = useTranslations('header');

  return (
    <Grid
      templateColumns={{ base: '1fr', md: '1fr auto 1fr' }}
      templateRows={{ base: 'auto auto', md: '1fr' }}
      alignItems='center'
      gap={{ base: 3, md: 4 }}
      paddingX={{ base: 4, md: 10 }}
      paddingY={{ base: 5, md: 10 }}
      minH='100px'
    >
      <GridItem
        display={{ base: 'none', md: 'block' }}
        gridColumn={{ base: '1', md: '1' }}
        gridRow={{ base: '1', md: '1' }}
      >
        <GitHubStars />
      </GridItem>

      <GridItem
        gridColumn={{ base: '1', md: '3' }}
        gridRow={{ base: '1', md: '1' }}
        display='flex'
        width={'full'}
        justifyContent={{ base: 'center', md: 'flex-end' }}
      >
        <AuthModal />
      </GridItem>

      <GridItem
        gridColumn={{ base: '1', md: '2' }}
        gridRow={{ base: '2', md: '1' }}
        display='flex'
        justifyContent='center'
      >
        <HStack gap={0} maxW='100%'>
          <Tooltip openDelay={100} closeDelay={100} content={t('learn')}>
            <Box as='span' display='inline-flex'>
              <Link href={'/learn'} aria-label='Learn Formula 1'>
                <IconButton
                  as={'span'}
                  variant={'ghost'}
                  rounded='full'
                  size={{ base: 'sm', md: 'md' }}
                  color={{ base: 'gray.500', _hover: 'gray.700' }}
                  aria-label='Learn Formula 1'
                >
                  <LuBookText />
                </IconButton>
              </Link>
            </Box>
          </Tooltip>

          <LocaleSwitch />

          <Center paddingX={{ base: 1, md: 3 }} flexShrink={1} minW={0}>
            <Link rel='noopener noreferrer' href={'/'}>
              <Image
                asChild
                filter='none'
                alt={'...'}
                width={{ base: '140px', sm: '190px', md: '250px' }}
                _dark={{ filter: 'invert(1)' }}
              >
                <NextImage
                  width={250}
                  src={Logo}
                  alt='...'
                  style={{ width: '100%', height: 'auto' }}
                />
              </Image>
            </Link>
          </Center>

          <Tooltip openDelay={100} closeDelay={100} content={t('theme')}>
            <Box as='span' display='inline-flex'>
              <ToggleThemeMode />
            </Box>
          </Tooltip>

          <Tooltip openDelay={100} closeDelay={100} content={t('minimalMode')}>
            <Box as='span' display='inline-flex'>
              <TogglePomodoroMode />
            </Box>
          </Tooltip>
        </HStack>
      </GridItem>
    </Grid>
  );
};
