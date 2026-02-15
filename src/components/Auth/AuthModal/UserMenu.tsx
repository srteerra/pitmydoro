'use client';

import React, { useRef } from 'react';
import { User } from 'firebase/auth';
import { Avatar, Circle, Float, Menu, Portal } from '@chakra-ui/react';
import { useTranslations } from 'use-intl';

interface Props {
  user: User;
  onLogout: () => void;
}

export const UserMenu = ({ user, onLogout }: Props) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const t = useTranslations('auth');
  const getAnchorRect = () => ref.current!.getBoundingClientRect();

  const handleLogout = () => {
    onLogout();
  };

  return (
    <Menu.Root positioning={{ getAnchorRect }}>
      <Menu.Trigger rounded='full' focusRing='outside'>
        <Avatar.Root borderRadius={'full'} size='lg' cursor='pointer' ref={ref}>
          <Avatar.Fallback name='Segun Adebayo' />
          <Avatar.Image
            src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`}
            alt='Avatar'
          />
          <Float placement='bottom-end' offsetX='1' offsetY='1'>
            <Circle bg='green.500' size='8px' outline='0.2em solid' outlineColor='bg' />
          </Float>
        </Avatar.Root>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Item disabled cursor='pointer' value='account'>
              {t('userMenu.profile')}
            </Menu.Item>
            <Menu.Item disabled cursor='pointer' value='settings'>
              {t('userMenu.myAccount')}
            </Menu.Item>
            <Menu.Item cursor='pointer' value='logout' onClick={handleLogout}>
              {t('userMenu.logOut')}
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};
