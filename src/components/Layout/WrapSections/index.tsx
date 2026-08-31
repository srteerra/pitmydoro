'use client';

import { Center, Container, Grid, GridItem, Text } from '@chakra-ui/react';
import { About } from '@/components/Layout/WrapSections/components/About';
import React from 'react';
import { useTranslations } from 'next-intl';
import tinycolor from 'tinycolor2';
import useSessionStore from '@/stores/Session.store';
import { TiDivider } from '@/components/Layout/WrapSections/components/Divider';
import { jersey15 } from '@/assets/fonts/Jersey';
import useSettingsStore from '@/stores/Settings.store';

export const WrapSections = () => {
  const sessionStatus = useSessionStore((state) => state.status);
  const currentScuderia = useSettingsStore((state) => state.currentScuderia);
  const t = useTranslations('sections');

  const bgColor = tinycolor(currentScuderia?.colors?.background?.[sessionStatus])
    .darken(2)
    .toString();

  const darkenColor = tinycolor(currentScuderia?.colors?.background?.[sessionStatus])
    .darken(50)
    .toString();

  return (
    <Container
      mt={'42px'}
      py={'80px'}
      px={0}
      color={{ base: 'gray.600', _dark: 'white' }}
      bgColor={{ base: bgColor, _dark: 'gray.900' }}
      fluid
    >
      <Grid templateColumns='2fr 12fr 2fr'>
        <GridItem colStart={2}>
          <Center flexDirection={'column'} textAlign={'center'} mb={'48px'}>
            <Text as={'h1'} textStyle={'4xl'} fontWeight='bold' className={jersey15.className}>
              {t('mainTitle')}
            </Text>

            <TiDivider width='10%' height={'4px'} color={darkenColor} />
          </Center>

          <About />
        </GridItem>
      </Grid>
    </Container>
  );
};
