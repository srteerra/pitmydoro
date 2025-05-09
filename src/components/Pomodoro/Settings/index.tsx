import {
  Box,
  CloseButton,
  Dialog,
  Flex,
  Grid,
  GridItem,
  Icon,
  IconButton,
  Tabs,
} from '@chakra-ui/react';
import { Portal } from '@zag-js/react';
import { TiCogOutline } from 'react-icons/ti';
import React, { useState } from 'react';
import { IconType } from 'react-icons';
import { GiFullMotorcycleHelmet } from 'react-icons/gi';
import { FaQuestion } from 'react-icons/fa';
import { General } from '@/components/Pomodoro/Settings/General';
import { Scuderia } from '@/components/Pomodoro/Settings/Scuderia';
import { Support } from '@/components/Pomodoro/Settings/Support';
import { useTranslations } from 'use-intl';
import "./styles.css"

interface LinkItemProps {
  name: string;
  icon: IconType;
  id: number;
}

enum Tab {
  GENERAL,
  SCUDERIA,
  SUPPORT,
}

const NavItem = ({ icon, isActive, children, ...rest }: any) => {
  return (
    <Box as='a' style={{ textDecoration: 'none' }} _focus={{ boxShadow: 'none' }}>
      <Flex
        align='center'
        marginBottom={{ base: '2', md: '6px' }}
        p='4'
        borderRadius='lg'
        role='group'
        cursor='pointer'
        bgColor={isActive ? 'primary.default/10' : 'transparent'}
        transition='0.3s'
        _hover={{
          bg: 'primary.dark',
          opacity: 0.9,
        }}
        {...rest}
      >
        {icon && (
          <Icon
            mr='4'
            fontSize='22px'
            _groupHover={{
              color: 'white',
            }}
            as={icon}
          />
        )}
        {children}
      </Flex>
    </Box>
  );
};

export const Settings = () => {
  const [activeTab, setActiveTab] = useState(Tab.GENERAL);
  const t = useTranslations('settings');

  const LinkItems: Array<LinkItemProps> = [
    { name: t('general'), icon: TiCogOutline, id: Tab.GENERAL },
    { name: t('scuderia'), icon: GiFullMotorcycleHelmet, id: Tab.SCUDERIA },
    { name: t('help'), icon: FaQuestion, id: Tab.SUPPORT },
  ];

  return (
    <Dialog.Root placement={'center'} size={'xl'} preventScroll={true}>
      <Dialog.Trigger asChild>
        <IconButton variant='ghost' size='md' rounded='full' aria-label='Settings'>
          <TiCogOutline />
        </IconButton>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content h='700px' backgroundColor={{ base: 'gray.50', _dark: 'dark.200' }}>
            <Dialog.Header display='flex' justifyContent='space-between'>
              <Dialog.Title>{t('title')}</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton size='sm' />
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body>
              <Grid
                templateColumns={{ base: '1fr', md: '2fr 6fr' }}
                templateRows={{ base: '1fr 6fr', md: '1fr' }}
                gap={4}
              >
                <GridItem>
                  <Tabs.Root
                    display={{ base: 'initial', md: 'none' }}
                    value={activeTab}
                    onValueChange={(e) => setActiveTab(e.value)}
                  >
                    <Tabs.List>
                      {LinkItems.map((link) => (
                        <Tabs.Trigger value={link.id}>{link.name}</Tabs.Trigger>
                      ))}
                    </Tabs.List>
                  </Tabs.Root>

                  <Box display={{ base: 'none', md: 'initial' }}>
                    {LinkItems.map((link) => (
                      <NavItem
                        key={link.name}
                        onClick={() => setActiveTab(link.id)}
                        isActive={activeTab === link.id}
                        icon={link.icon}
                      >
                        {link.name}
                      </NavItem>
                    ))}
                  </Box>
                </GridItem>

                <GridItem
                  paddingX={{ base: '0px', md: '20px' }}
                  overflow="auto"
                  maxH={{ base: '500px', md: '600px' }}
                  className={'scrollStyles'}
                >
                  {activeTab === Tab.GENERAL && <General />}
                  {activeTab === Tab.SCUDERIA && <Scuderia />}
                  {activeTab === Tab.SUPPORT && <Support />}
                </GridItem>
              </Grid>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
