'use client';

import React from 'react';
import { Box, Center, Container, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import { LuMonitorPlay } from 'react-icons/lu';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Layout/Header';
import { InDevelopmentBadge } from '@/components/InDevelopmentBadge';
import { OverlayConfigurator } from '@/components/StreamOverlay/OverlayConfigurator';

export default function StreamOverlayPage() {
  const { user, loading } = useAuth();

  return (
    <>
      <Header />
      <Container maxW='6xl' py={{ base: 6, md: 10 }} minH='100vh'>
        <Flex align='center' gap={3} mb={1}>
          <Heading size='2xl'>Stream Overlay</Heading>
          <InDevelopmentBadge />
        </Flex>
        <Text color={{ base: 'gray.600', _dark: 'gray.400' }} mb={8}>
          A live overlay for OBS that mirrors your Pomodoro — timer, car and current task.
        </Text>

        {loading ? null : user ? (
          <OverlayConfigurator />
        ) : (
          <Center py={16}>
            <VStack gap={4} maxW='420px' textAlign='center'>
              <Box fontSize='4xl'>
                <LuMonitorPlay />
              </Box>
              <Heading size='md'>Log in to use Streamer Mode</Heading>
              <Text fontSize='sm' color={{ base: 'gray.600', _dark: 'gray.400' }}>
                Streamer mode is available for registered users. Log in to generate your private
                overlay URL and sync your timer to OBS.
              </Text>
            </VStack>
          </Center>
        )}
      </Container>
    </>
  );
}
