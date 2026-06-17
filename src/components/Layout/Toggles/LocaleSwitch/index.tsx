'use client';

import { setUserLocale } from '@/services/locale.service';
import { IconButton, Image, Menu, Text } from '@chakra-ui/react';
import { Portal } from '@zag-js/react';
import { IoEarth } from 'react-icons/io5';
import { Locale } from 'moment';
import { useTransition } from 'react';
import useSettingsStore from '@/stores/Settings.store';

interface Props {
  portalDisabled?: boolean;
}

export function LocaleSwitch({ portalDisabled = false }: Props) {
  const [isPending, startTransition] = useTransition();
  const setLocale = useSettingsStore((state) => state.setLocale);

  const onChange = (value: string | Locale) => {
    const locale = value as Locale;
    startTransition(() => {
      setUserLocale(locale as any);
      setLocale(locale as any);
    });
  };

  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <IconButton
          data-pw-id={'locale-switcher'}
          variant={'ghost'}
          rounded='full'
          color={{ base: 'gray.500', _hover: 'gray.700' }}
          disabled={isPending}
        >
          <IoEarth />
        </IconButton>
      </Menu.Trigger>
      <Portal disabled={portalDisabled}>
        <Menu.Positioner>
          <Menu.Content data-pw-id={'locale-content'}>
            <Menu.Item
              data-pw-id={'locale-menuItem'}
              value='new-txt'
              onClick={() => onChange('en')}
            >
              <Image w={5} src='/icons/usa.png' alt='English' />
              <Text>English</Text>
            </Menu.Item>
            <Menu.Item
              data-pw-id={'locale-menuItem'}
              value='new-file'
              onClick={() => onChange('es')}
            >
              <Image w={5} src='/icons/spain.png' alt='Italian' />
              <Text>Español</Text>
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
