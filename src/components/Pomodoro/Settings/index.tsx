import { Box, Flex, Grid, GridItem, Icon, Tabs } from '@chakra-ui/react';
import { TiCogOutline } from 'react-icons/ti';
import React, { useState } from 'react';
import { IconType } from 'react-icons';
import { GiFullMotorcycleHelmet } from 'react-icons/gi';
import { LuInfo } from 'react-icons/lu';
import { General } from '@/components/Pomodoro/Settings/General';
import { Scuderia } from '@/components/Pomodoro/Settings/Scuderia';
import { Support } from '@/components/Pomodoro/Settings/Support';
import { Tooltip } from '@/components/ui/tooltip';
import { useTranslations } from 'next-intl';
import './styles.css';
import useSettingsStore from '@/stores/Settings.store';
import { PomodoroMode } from '@/interfaces/Settings.interface';

export enum Tab {
  GENERAL = 'general',
  SCUDERIA = 'scuderia',
  SUPPORT = 'support',
}

interface SettingsProps {
  initialTab?: Tab;
}

interface LinkItemProps {
  name: string;
  icon: IconType;
  id: Tab;
}

const NavItem = ({ icon, isActive, disabled, tooltip, children, ...rest }: any) => {
  return (
    <Box style={{ textDecoration: 'none' }} _focus={{ boxShadow: 'none' }}>
      <Flex
        align='center'
        marginBottom={{ base: '2', md: '6px' }}
        p='4'
        borderRadius='lg'
        role='group'
        cursor={disabled ? 'not-allowed' : 'pointer'}
        opacity={disabled ? 0.4 : 1}
        bgColor={isActive ? 'primary.default/10' : 'transparent'}
        transition='0.3s'
        _hover={disabled ? {} : { bg: 'primary.dark', opacity: 0.9 }}
        {...rest}
      >
        {icon && (
          <Icon mr='4' fontSize='22px' _groupHover={disabled ? {} : { color: 'white' }} as={icon} />
        )}
        {children}
        {disabled && tooltip && (
          <Tooltip content={tooltip} showArrow positioning={{ placement: 'right' }}>
            <Box
              as='span'
              display='inline-flex'
              alignItems='center'
              ml='2'
              cursor='help'
              opacity={0.7}
              onClick={(e) => e.stopPropagation()}
            >
              <Icon as={LuInfo} fontSize='16px' />
            </Box>
          </Tooltip>
        )}
      </Flex>
    </Box>
  );
};

export const Settings = ({ initialTab = Tab.GENERAL }: SettingsProps) => {
  const [activeTab, setActiveTab] = useState<string | Tab>(initialTab);
  const mode = useSettingsStore((state) => state.mode);
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
              <Tabs.Trigger
                key={idx}
                value={link.id}
                disabled={link.id === Tab.SCUDERIA && mode === PomodoroMode.MINIMAL}
              >
                {link.name}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs.Root>

        <Box display={{ base: 'none', md: 'initial' }}>
          {LinkItems.map((link) => {
            const disabled = link.id === Tab.SCUDERIA && mode === PomodoroMode.MINIMAL;

            return (
              <NavItem
                key={link.name}
                onClick={disabled ? undefined : () => setActiveTab(link.id)}
                isActive={activeTab === link.id}
                icon={link.icon}
                disabled={disabled}
                tooltip={disabled ? t('scuderiaDisabled') : undefined}
              >
                {link.name}
              </NavItem>
            );
          })}
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
