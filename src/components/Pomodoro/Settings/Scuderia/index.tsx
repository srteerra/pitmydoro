import {
  Box,
  ColorSwatchMix,
  Flex,
  HStack,
  Image,
  RadioCard, Skeleton,
  Text,
  VStack,
} from '@chakra-ui/react';
import F1Car from '../../../../../public/images/f1car.png';
import NextImage from 'next/image';
import { ITeam } from '@/interfaces/Teams.interface';
import React, { useEffect, useState } from 'react';
import { useSettings } from '@/hooks/useSettings';
import useTeamsStore from '@/stores/Teams.store';
import { ColorPreview } from "@/components/ColorPreview";

export const Scuderia = () => {
  const { currentScuderia, changeScuderia } = useSettings();
  const teams = useTeamsStore((state) => state.teams);
  const fetched = useTeamsStore((state) => state.fetched);
  const [selectedScuderia, setSelectedScuderia] = useState<string | null>(
    currentScuderia?.id || null
  );

  const handleChange = (value: string) => {
    if (value === selectedScuderia) return;
    setSelectedScuderia(value);
    changeScuderia(value);
  };

  useEffect(() => {
    if (!selectedScuderia) {
      setSelectedScuderia(teams[0]?.id);
      changeScuderia(teams[0]?.id);
    }
  }, [teams, selectedScuderia]);

  return (
    <Box>
      <Text fontWeight={'bold'} fontSize={'lg'}>
        Scuderia
      </Text>

      <VStack alignItems='start' marginY={'20px'}>
        <RadioCard.Root
          orientation='horizontal'
          align='center'
          justify='center'
          maxW='lg'
          value={selectedScuderia}
          onValueChange={(e) => handleChange(e.value)}
          defaultValue={teams[0]?.id}
        >
          <VStack align='stretch'>
            {teams.map((team: ITeam) => (
              <Skeleton height="150px" loading={!fetched}>
                <RadioCard.Item
                  key={team.id}
                  value={team.id}
                  borderRadius={'xl'}
                  borderWidth={'3px'}
                  borderColor={{ base: 'gray.100', _dark: 'gray.700' }}
                  boxShadow={'none'}
                  _hover={{
                    bgColor: 'gray.100',
                    _dark: {
                      bgColor: 'gray.600',
                    },
                  }}
                  _checked={{
                    borderWidth: '3px',
                    borderColor: 'gray.300',
                    _dark: {
                      borderColor: 'gray.400',
                    },
                  }}
                >
                  <RadioCard.ItemHiddenInput />
                  <RadioCard.ItemControl cursor='pointer'>
                    <Flex w={'full'} paddingX={'20px'} paddingY={'10px'} justifyContent={'space-between'} alignItems='center'>
                      <Box display='flex' flexDirection='column' alignItems='start' gap={4} w={'full'} flex={1}>
                        <Flex alignItems='center' gap={2}>
                          <Skeleton borderRadius={"full"} loading={!fetched}>
                            <Image src={team.logoURL} w={'50px'} h={'50px'} />
                          </Skeleton>

                          <Text fontWeight={'bold'} fontSize={'lg'}>
                            {team.name}
                          </Text>
                        </Flex>

                        <ColorPreview colors={team.colors} />
                      </Box>

                      <Image asChild>
                        <NextImage width={200} height={100} src={team?.carURL ?? F1Car} alt='...' />
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
