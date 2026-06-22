import { Badge, Box, Flex, HStack, Image, RadioCard, Skeleton, Text, VStack, } from '@chakra-ui/react';
import { Team } from '@/interfaces/Teams.interface';
import React, { useMemo, useState } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { ColorPreview } from '@/components/Pomodoro/components/ColorPreview';
import { useTranslations } from 'use-intl';
import { SCUDERIAS } from '@/constants/Scuderias';
import _ from 'lodash';
import tinycolor from 'tinycolor2';
import { SpriteAnimation } from '@/components/SpriteAnimation';
import useSettingsStore from '@/stores/Settings.store';

export const Scuderia = () => {
  const { changeScuderia } = useSettings();
  const currentScuderia = useSettingsStore((state) => state.currentScuderia);
  const t = useTranslations('settings');
  const [selectedYear, setSelectedYear] = useState(currentScuderia?.year || '2025');
  const [selectedScuderia, setSelectedScuderia] = useState<string | null>(
    currentScuderia?.id || null
  );

  const AVAILABLE_YEARS = _.uniq(_.map(SCUDERIAS, 'year'));

  const filteredTeams = useMemo(
    () => SCUDERIAS.filter((team) => team.year === selectedYear),
    [selectedYear]
  );

  const handleScuderiaChange = (value: string) => {
    setSelectedScuderia(value);
    changeScuderia(value);
  };

  return (
    <Box>
      <Text fontWeight={'bold'} fontSize={'lg'} marginBottom={3}>
        {t('scuderia')}
      </Text>

      <HStack>
        {AVAILABLE_YEARS.map((year: string) => (
          <Badge
            key={year}
            variant={selectedYear === year ? 'solid' : 'outline'}
            size={'lg'}
            cursor={'pointer'}
            onClick={() => setSelectedYear(year)}
            colorPalette={'white'}
            borderRadius={'full'}
          >
            {year}
          </Badge>
        ))}
      </HStack>

      <VStack alignItems='start' marginY={'20px'}>
        <RadioCard.Root
          orientation='horizontal'
          align='center'
          justify='center'
          maxW='lg'
          value={selectedScuderia}
          onValueChange={(e) => handleScuderiaChange(e.value as string)}
          defaultValue={SCUDERIAS[0]?.id}
        >
          <VStack align='stretch'>
            {filteredTeams.map((team: Team) => (
              <Skeleton key={team.id} minH='150px' loading={!team}>
                <RadioCard.Item
                  key={team.id}
                  value={team.id}
                  borderRadius={'xl'}
                  borderWidth={'3px'}
                  background={'gray.100'}
                  boxShadow={'none'}
                  borderColor={{ base: 'gray.100', _dark: 'gray.800' }}
                  _dark={{ background: 'gray.900' }}
                  _hover={{
                    opacity: 0.8,
                    borderColor: 'gray.200',
                    _dark: {
                      borderColor: 'gray.800',
                    },
                  }}
                  _checked={{
                    backgroundColor: tinycolor(team.colors.background.session).darken(5).toString(),
                    borderColor: tinycolor(team.colors.background.session).darken(10).toString(),
                    _dark: {
                      backgroundColor: tinycolor(team.colors.background.session)
                        .brighten(-90)
                        .toString(),
                      borderColor: tinycolor(team.colors.background.session)
                        .brighten(-80)
                        .toString(),
                    },
                  }}
                >
                  <RadioCard.ItemHiddenInput />
                  <RadioCard.ItemControl cursor='pointer'>
                    <Flex
                      w={'full'}
                      paddingX={{ base: '14px', md: '20px' }}
                      paddingY={{ base: '18px', md: '10px' }}
                      gap={{ base: 5, md: 0 }}
                      justifyContent={{ base: 'center', md: 'space-between' }}
                      alignItems='center'
                      flexWrap={'wrap'}
                    >
                      <Box
                        display='flex'
                        flexDirection='column'
                        alignItems='start'
                        gap={4}
                        w={'full'}
                        flex={1}
                      >
                        <Flex alignItems='center' gap={2}>
                          <Skeleton borderRadius={'full'} loading={!team}>
                            <Image src={team.logoURL} w={'50px'} h={'50px'} alt={'...'} />
                          </Skeleton>

                          <Text fontWeight={'bold'} fontSize={'lg'}>
                            {team.name}
                          </Text>
                        </Flex>

                        <Box display={{ base: 'none', md: 'block' }}>
                          <ColorPreview colors={team.colors} />
                        </Box>
                      </Box>

                      <Image asChild alt={'team-car'}>
                        <SpriteAnimation
                          src={team?.spriteURL as string}
                          frameHeight={68}
                          frameWidth={210}
                          totalFrames={6}
                          paused={false}
                        />
                      </Image>
                    </Flex>
                  </RadioCard.ItemControl>
                </RadioCard.Item>
              </Skeleton>
            ))}
          </VStack>
        </RadioCard.Root>
      </VStack>
    </Box>
  );
};
