import { ToggleMode } from '@/components/Layout/Toggles/ThemeMode';
import { Center, HStack, Image } from '@chakra-ui/react';
import React from 'react';
import NextImage from 'next/image';
import Logo from '../../../../public/images/pitmydoro.webp';
import { LocaleSwitch } from '@/components/Layout/Toggles/LocaleSwitch';
import Link from 'next/link';
import { AuthModal } from '@/components/Auth/AuthModal';

export const Header = () => {
  return (
    <HStack
      justifyContent={'space-between'}
      alignItems={'center'}
      gap={4}
      padding={10}
      minH='100px'
    >
      <AuthModal />

      <HStack>
        <LocaleSwitch />

        <Center>
          <Link rel='noopener noreferrer' href={'/public'}>
            <Image asChild filter='none' alt={'...'} _dark={{ filter: 'invert(1)' }}>
              <NextImage width={250} src={Logo} alt='...' />
            </Image>
          </Link>
        </Center>

        <ToggleMode />
      </HStack>

      <AuthModal />
    </HStack>
  );
};
