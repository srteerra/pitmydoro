'use client';

import React, { useRef } from 'react';
import { User } from 'firebase/auth';
import { Avatar, Circle, Float, HStack, Menu, Portal } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { BiStats } from 'react-icons/bi';
import useUserStore from '@/stores/User.store';
import { useDrawer } from '@/contexts/DrawerContext';
import { ReportsDialog } from '@/components/Tasks/ReportsDialog';
import { StreakBadge } from '@/components/Streak/StreakBadge';
import { StreakSummary } from '@/components/Streak/StreakSummary';
import { useRouter } from 'next/navigation';

interface Props {
  user: User;
  onLogout: () => void;
}

export const UserMenu = ({ user, onLogout }: Props) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const t = useTranslations('auth');
  const reportsT = useTranslations('reports');
  const username = useUserStore((state) => state.profile?.username);
  const { openDrawer } = useDrawer();
  const router = useRouter();
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

  const handleProfile = () => {
    router.push('/profile');
  };

  return (
    <HStack gap={4}>
      <StreakBadge />

      <Menu.Root positioning={{ getAnchorRect }}>
        <Menu.Trigger rounded='full' focusRing='outside'>
          <Avatar.Root borderRadius={'full'} size='lg' cursor='pointer' ref={ref}>
            <Avatar.Fallback name={username || user?.email || ''} />
            <Avatar.Image
              src={user?.photoURL ?? undefined}
              alt={username || user?.email || ''}
              referrerPolicy='no-referrer'
            />
            <Float placement='bottom-end' offsetX='1' offsetY='1'>
              <Circle bg='green.500' size='8px' outline='0.2em solid' outlineColor='bg' />
            </Float>
          </Avatar.Root>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              <StreakSummary />
              <Menu.Separator />
              <Menu.Item cursor='pointer' value='account' onClick={handleProfile}>
                {t('userMenu.profile')}
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
    </HStack>
  );
};
