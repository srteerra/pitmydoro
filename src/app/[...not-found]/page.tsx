'use client';

import { Button, Center, Image, Text, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { jersey15 } from '@/assets/fonts/Jersey';
import { useTranslations } from 'next-intl';

export default function NotFoundPage() {
  const router = useRouter();
  const t = useTranslations('404');

  return (
    <Center minH='100vh'>
      <VStack textAlign='center' px={6} gap={6}>
        <Image
          src='/images/404.webp'
          alt='404'
          width={{ base: '100%', md: '50%' }}
          height={{ base: '100%', md: '50%' }}
          objectFit='contain'
        />

        <Text
          fontSize={{ base: '5xl', md: '9xl' }}
          m={0}
          p={0}
          lineHeight={'100px'}
          className={jersey15.className}
        >
          404
        </Text>

        <Text fontSize='lg' opacity={0.7}>
          {t('title')}
        </Text>

        <Button
          bgColor='primary.default'
          size='lg'
          borderRadius='full'
          onClick={() => router.push('/')}
        >
          {t('goBack')}
        </Button>
      </VStack>
    </Center>
  );
}
