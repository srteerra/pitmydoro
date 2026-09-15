'use client';

import { Box, Button, Center, Flex, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import { LuSearchX } from 'react-icons/lu';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { jersey15 } from '@/assets/fonts/Jersey';

const SkeletonBar = ({ width, height = '14px' }: { width: string; height?: string }) => (
  <Box
    width={width}
    height={height}
    borderRadius='full'
    backgroundColor={{ base: 'gray.100', _dark: 'whiteAlpha.100' }}
  />
);

const SkeletonCard = () => (
  <Box
    flex='1'
    minWidth='120px'
    height='72px'
    borderRadius='xl'
    backgroundColor={{ base: 'gray.50', _dark: 'whiteAlpha.50' }}
    borderWidth='1px'
    borderColor={{ base: 'gray.100', _dark: 'whiteAlpha.100' }}
  />
);

export const ProfileNotFound = ({ username }: { username: string }) => {
  const router = useRouter();
  const t = useTranslations('profile');

  return (
    <Center w='full' paddingX={{ base: 3, md: 6 }} paddingY={{ base: 4, md: 8 }}>
      <Box
        data-pw-id='profile-not-found'
        w='full'
        maxW='5xl'
        borderRadius='2xl'
        boxShadow='sm'
        overflow='hidden'
        pb={{ base: 8, md: 10 }}
        backgroundColor={{ base: 'white', _dark: { base: 'white', md: 'dark.200' } }}
      >
        <Box
          w='full'
          h={{ base: '150px', sm: '200px', md: '240px' }}
          backgroundColor={{ base: 'gray.100', _dark: 'whiteAlpha.100' }}
        />

        <Box paddingX={{ base: 5, md: 8 }}>
          <Flex justify='space-between' align='flex-end' gap={4} wrap='wrap'>
            <Center
              position='relative'
              zIndex={1}
              mt={{ base: '-60px', sm: '-74px', md: '-88px' }}
              boxSize={{ base: '124px', sm: '156px', md: '184px' }}
              borderRadius='2xl'
              borderWidth='2px'
              borderStyle='dashed'
              borderColor={{ base: 'gray.300', _dark: 'whiteAlpha.300' }}
              backgroundColor={{ base: 'gray.50', _dark: 'dark.300' }}
              color={{ base: 'gray.400', _dark: 'whiteAlpha.500' }}
              fontSize={{ base: '40px', md: '56px' }}
            >
              <LuSearchX />
            </Center>
          </Flex>

          <VStack align='stretch' gap={5} mt={6}>
            <Box>
              <Heading size={{ base: 'xl', md: '2xl' }} color='fg.muted'>
                {t('notFoundTitle')}
              </Heading>

              <Text
                data-pw-id='profile-not-found-username'
                fontSize={{ base: 'xl', md: '2xl' }}
                fontWeight='medium'
                color='fg.muted'
                className={jersey15.className}
                truncate
              >
                @{username}
              </Text>
            </Box>

            <Text fontSize={{ base: 'sm', md: 'md' }} color='fg.muted' maxW='520px'>
              {t('notFoundDescription', { username })}
            </Text>

            <Text fontSize='sm' color='fg.subtle' maxW='520px'>
              {t('notFoundHint')}
            </Text>

            <VStack align='stretch' gap={3} opacity={0.55} aria-hidden='true' mt={2}>
              <SkeletonBar width='60%' />
              <SkeletonBar width='40%' />

              <HStack gap={3} mt={2} flexWrap='wrap'>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </HStack>
            </VStack>

            <HStack gap={3} flexWrap='wrap' mt={2}>
              <Button
                data-pw-id='profile-not-found-home'
                borderRadius='full'
                size='lg'
                px={7}
                onClick={() => router.push('/')}
              >
                {t('goHome')}
              </Button>

              <Button
                data-pw-id='profile-not-found-leaderboard'
                variant='outline'
                borderRadius='full'
                size='lg'
                px={7}
                onClick={() => router.push('/leaderboard')}
              >
                {t('notFoundLeaderboard')}
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Box>
    </Center>
  );
};
