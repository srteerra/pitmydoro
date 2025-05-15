'use client';

import { Box, Button, Card, CloseButton, Flex, Image } from '@chakra-ui/react';
import { useBottomBannerStore } from '@/stores/Banner.store';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import Link from 'next/link';
import { TbExternalLink } from 'react-icons/tb';

const MotionCard = motion(Card.Root);

export const BottomBanner = () => {
  const {
    isVisible,
    title,
    smallText,
    link,
    description,
    declineText,
    acceptText,
    image,
    hideBanner,
    onDecline,
    onAccept,
  } = useBottomBannerStore();

  if (!isVisible) return null;

  return (
    <Flex
      justifyContent='flex-end'
      position='fixed'
      bottom='0'
      right='0'
      w={'auto'}
      zIndex={100}
      p={4}
    >
      <AnimatePresence>
        <MotionCard
          width='450px'
          variant='elevated'
          borderRadius='3xl'
          backgroundColor={{ base: 'white', _dark: 'dark.300' }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{
            duration: 0.15,
            scale: {
              type: 'spring',
              bounce: 0.7,
            },
          }}
        >
          <Card.Body position='relative'>
            <CloseButton
              size='sm'
              onClick={() => hideBanner()}
              position={'absolute'}
              top={5}
              right={5}
            />

            {image && (
              <Image
                src={image}
                alt='Banner Image'
                width='130px'
                height='auto'
                mt={0}
                borderRadius='md'
                mb='2'
              />
            )}

            <Card.Title mb={2} fontSize={'2xl'} fontWeight={800} textWrap={'balance'}>
              {title}
            </Card.Title>
            <Card.Description>{description}</Card.Description>

            {link && (
              <Box mt={3} fontSize='sm' display={'flex'} alignItems='center' gap={1}>
                <Link href={link}>Mas información</Link>
                <TbExternalLink />
              </Box>
            )}

            {smallText && (
              <Box mt={3} fontSize='sm' color='gray.400'>
                <small>{smallText}</small>
              </Box>
            )}
          </Card.Body>
          <Card.Footer justifyContent='flex-end'>
            <Button
              variant='outline'
              _hover={{
                bgColor: { base: 'danger/10', _dark: 'white/20' },
              }}
              bgColor={{ base: 'danger/5', _dark: 'white/20' }}
              borderColor={{ base: 'transparent', _dark: 'transparent' }}
              color={{ base: 'danger/60', _dark: 'white' }}
              flex='1'
              borderRadius='md'
              onClick={() => {
                if (onDecline) onDecline();
                hideBanner();
              }}
            >
              {declineText}
            </Button>

            <Button
              flex='1'
              borderRadius='md'
              bgColor='primary.default'
              _hover={{
                bgColor: { base: 'primary.default/80', _dark: 'white/20' },
              }}
              color={{ base: 'white', _dark: 'white' }}
              onClick={() => {
                if (onAccept) onAccept();
                hideBanner();
              }}
            >
              {acceptText}
            </Button>
          </Card.Footer>
        </MotionCard>
      </AnimatePresence>
    </Flex>
  );
};
