import { ToggleThemeMode } from '@/components/Layout/Toggles/ThemeMode';
import { Center, HStack, Image, Grid, GridItem, IconButton } from '@chakra-ui/react';
import React from 'react';
import NextImage from 'next/image';
import Logo from '../../../../public/images/pitmydoro.webp';
import { LocaleSwitch } from '@/components/Layout/Toggles/LocaleSwitch';
import Link from 'next/link';
import { AuthModal } from '@/components/Auth/AuthModal';
import GitHubStars from '@/components/GithubStars';
import { LuBookText } from 'react-icons/lu';
import { TogglePomodoroMode } from '@/components/Layout/Toggles/PomodoroMode';

export const Header = () => {
  return (
    <Grid
      templateColumns={{ base: '1fr', md: '1fr auto 1fr' }}
      templateRows={{ base: 'auto auto', md: '1fr' }}
      alignItems='center'
      gap={4}
      padding={10}
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
        <HStack gap={0}>
          <IconButton
            variant={'ghost'}
            rounded='full'
            color={{ base: 'gray.500', _hover: 'gray.700' }}
          >
            <LuBookText />
          </IconButton>
          <LocaleSwitch />

          <Center paddingX={3}>
            <Link rel='noopener noreferrer' href={'/public'}>
              <Image asChild filter='none' alt={'...'} _dark={{ filter: 'invert(1)' }}>
                <NextImage width={250} src={Logo} alt='...' />
              </Image>
            </Link>
          </Center>

          <ToggleThemeMode />
          <TogglePomodoroMode />
        </HStack>
      </GridItem>
    </Grid>
  );
};
