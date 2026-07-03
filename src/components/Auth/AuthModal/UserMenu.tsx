'use client';

import React, { useRef } from 'react';
import { User } from 'firebase/auth';
import { Avatar, Circle, Float, Menu, Portal } from '@chakra-ui/react';
import { useTranslations } from 'use-intl';
import { BiStats } from 'react-icons/bi';
import useUserStore from '@/stores/User.store';
import { useDrawer } from '@/contexts/DrawerContext';
import { ReportsDialog } from '@/components/Tasks/ReportsDialog';

interface Props {
  user: User;
  onLogout: () => void;
}

export const UserMenu = ({ user, onLogout }: Props) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const t = useTranslations('auth');
  const reportsT = useTranslations('reports');
  const userAvatar = useUserStore((state) => state.profile?.photoURL);
  const { openDrawer } = useDrawer();
  const getAnchorRect = () => ref.current!.getBoundingClientRect();

  const handleLogout = () => {
    onLogout();
  };

  const handleOpenReports = () => {
    openDrawer({
      topTitle: {
        label: reportsT('title'),
        icon: <BiStats />,
      },
      component: <ReportsDialog />,
      offset: 4,
    });
  };

  return (
    <Menu.Root positioning={{ getAnchorRect }}>
      <Menu.Trigger rounded='full' focusRing='outside'>
        <Avatar.Root borderRadius={'full'} size='lg' cursor='pointer' ref={ref}>
          <Avatar.Fallback name='Segun Adebayo' />
          <Avatar.Image
            src={userAvatar || user?.photoURL || `https://ui-avatars.com/api/?name=${user.email}`}
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
            <Menu.Item cursor='pointer' value='reports' onClick={handleOpenReports}>
              {t('userMenu.reports')}
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
