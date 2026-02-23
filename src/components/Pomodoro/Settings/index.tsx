import { Box, Flex, Grid, GridItem, Icon, Tabs } from '@chakra-ui/react';
import { TiCogOutline } from 'react-icons/ti';
import React, { useState } from 'react';
import { IconType } from 'react-icons';
import { GiFullMotorcycleHelmet } from 'react-icons/gi';
import { General } from '@/components/Pomodoro/Settings/General';
import { Scuderia } from '@/components/Pomodoro/Settings/Scuderia';
import { Support } from '@/components/Pomodoro/Settings/Support';
import { useTranslations } from 'use-intl';
import './styles.css';

enum Tab {
  GENERAL = 'general',
  SCUDERIA = 'scuderia',
  SUPPORT = 'support',
}

interface LinkItemProps {
  name: string;
  icon: IconType;
  id: Tab;
}

const NavItem = ({ icon, isActive, children, ...rest }: any) => {
  return (
    <Box style={{ textDecoration: 'none' }} _focus={{ boxShadow: 'none' }}>
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
  const [activeTab, setActiveTab] = useState<string | Tab>(Tab.GENERAL);
  const t = useTranslations('settings');

  const LinkItems: Array<LinkItemProps> = [
    { name: t('general'), icon: TiCogOutline, id: Tab.GENERAL },
    { name: t('scuderia'), icon: GiFullMotorcycleHelmet, id: Tab.SCUDERIA },
    // { name: t('help'), icon: FaQuestion, id: Tab.SUPPORT },
  ];

  return (
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
            {LinkItems.map((link, idx) => (
              <Tabs.Trigger key={idx} value={link.id}>
                {link.name}
              </Tabs.Trigger>
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
        overflow='auto'
        maxH={{ base: '500px', md: '600px' }}
        className={'scrollStyles'}
      >
        {activeTab === Tab.GENERAL && <General />}
        {activeTab === Tab.SCUDERIA && <Scuderia />}
        {activeTab === Tab.SUPPORT && <Support />}
      </GridItem>
    </Grid>
  );
};
