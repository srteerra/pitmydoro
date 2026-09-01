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
import { LuBookText, LuCoffee, LuMegaphone, LuMenu, LuMonitorPlay } from 'react-icons/lu';
import { TogglePomodoroMode } from '@/components/Layout/Toggles/PomodoroMode';
import { Tooltip } from '@/components/ui/tooltip';
import { useTranslations } from 'next-intl';
import { useDrawer } from '@/contexts/DrawerContext';
import { useTimerGuard } from '@/hooks/useTimerGuard';
import { MobileMenu } from './MobileMenu';
import { usePathname } from 'next/navigation';

export const Header = () => {
  const t = useTranslations('header');
  const { openDrawer } = useDrawer();
  const { guardLink } = useTimerGuard();
  const pathname = usePathname();
  const isPomodoroPage = pathname === '/';

  const handleOpenMenu = () => {
    openDrawer({
      component: MobileMenu,
      placement: 'start',
      size: 'xs',
      topTitle: {
        label: 'Pitmydoro.com',
      },
    });
  };

  return (
    <React.Fragment>
      <Grid
        display={{ base: 'grid', lg: 'none' }}
        templateColumns='1fr auto 1fr'
        alignItems='center'
        paddingX={4}
        paddingY={4}
        minH='72px'
      >
        <GridItem justifySelf='start'>
          <IconButton
            data-pw-id='mobile-menu-button'
            aria-label='Open menu'
            variant='ghost'
            rounded='full'
            color={{ base: 'gray.600', _hover: 'gray.800' }}
            onClick={handleOpenMenu}
          >
            <LuMenu />
          </IconButton>
        </GridItem>

        <GridItem justifySelf='center' minW={0}>
          <Link rel='noopener noreferrer' href={'/'}>
            <Image asChild filter='none' alt={'...'} width='200px' _dark={{ filter: 'invert(1)' }}>
              <NextImage src={Logo} alt='...' />
            </Image>
          </Link>
        </GridItem>

        <GridItem justifySelf='end'>
          <AuthModal />
        </GridItem>
      </Grid>

      <Grid
        display={{ base: 'none', lg: 'grid' }}
        templateColumns={{ base: '1fr', lg: '1fr auto 1fr' }}
        templateRows={{ base: 'auto auto', lg: '1fr' }}
        alignItems='center'
        gap={{ base: 3, lg: 4 }}
        paddingX={{ base: 4, lg: 10 }}
        paddingY={{ base: 5, lg: 10 }}
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
          <HStack gap={2}>
            {isPomodoroPage && (
              <Tooltip openDelay={100} closeDelay={100} content={t('minimalMode')}>
                <Box as='span' display='inline-flex'>
                  <TogglePomodoroMode />
                </Box>
              </Tooltip>
            )}
            <AuthModal />
          </HStack>
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
                <Link
                  href={'/learn'}
                  aria-label='Learn Formula 1'
                  onClick={(e) => guardLink(e, '/learn')}
                >
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

            <Tooltip openDelay={100} closeDelay={100} content='Stream Overlay'>
              <Box as='span' display='inline-flex'>
                <Link
                  href={'/stream-overlay'}
                  aria-label='Stream overlay for OBS'
                  onClick={(e) => guardLink(e, '/stream-overlay')}
                >
                  <IconButton
                    as={'span'}
                    variant={'ghost'}
                    rounded='full'
                    size={{ base: 'sm', md: 'md' }}
                    color={{ base: 'gray.500', _hover: 'gray.700' }}
                    aria-label='Stream overlay for OBS'
                  >
                    <LuMonitorPlay />
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

            <Tooltip openDelay={100} closeDelay={100} content={'Community'}>
              <Box as='span' display='inline-flex'>
                <IconButton
                  variant={'ghost'}
                  rounded='full'
                  size={{ base: 'sm', md: 'md' }}
                  color={{ base: 'gray.500', _hover: 'gray.700' }}
                  aria-label='Community'
                  disabled
                >
                  <LuMegaphone />
                </IconButton>
              </Box>
            </Tooltip>

            <Tooltip openDelay={100} closeDelay={100} content={`${t('comingSoon')}`}>
              <Box as='span' display='inline-flex'>
                <IconButton
                  variant={'ghost'}
                  rounded='full'
                  size={{ base: 'sm', md: 'md' }}
                  color={{ base: 'gray.500', _hover: 'gray.700' }}
                  aria-label={t('donate')}
                  disabled
                >
                  <LuCoffee />
                </IconButton>
              </Box>
            </Tooltip>
          </HStack>
        </GridItem>
      </Grid>
    </React.Fragment>
  );
};
