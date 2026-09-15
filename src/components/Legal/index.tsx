'use client';

import React from 'react';
import { Box, Flex, Link as ChakraLink, Text, VStack } from '@chakra-ui/react';
import NextLink from 'next/link';

export const LegalPage = ({
  agreement,
  title,
  lastUpdated,
  children,
}: {
  agreement: string;
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) => (
  <Flex as='main' flexDirection='column' marginY={{ base: 16, md: 28 }} maxWidth='820px'>
    <Text as='p' fontSize='xs' letterSpacing='widest' opacity={0.6} fontWeight='bold'>
      {agreement}
    </Text>

    <Text as='h1' fontSize={{ base: '3xl', md: '4xl' }} fontWeight='bold' marginTop={2}>
      {title}
    </Text>

    <Text as='p' fontSize='sm' opacity={0.55} marginTop={2} marginBottom={10}>
      {lastUpdated}
    </Text>

    <VStack alignItems='flex-start' gap={10}>
      {children}
    </VStack>
  </Flex>
);

export const LegalIntro = ({ children }: { children: React.ReactNode }) => (
  <Text as='p' fontSize='md' lineHeight='tall'>
    {children}
  </Text>
);

export const LegalCallout = ({ children }: { children: React.ReactNode }) => (
  <Box
    borderLeftWidth='3px'
    borderColor={{ base: 'gray.300', _dark: 'whiteAlpha.400' }}
    paddingLeft={4}
    paddingY={1}
  >
    <Text as='p' fontSize='sm' opacity={0.85}>
      {children}
    </Text>
  </Box>
);

export const LegalSection = ({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) => (
  <Flex
    as='section'
    id={id}
    scrollMarginTop={{ base: 6, md: 10 }}
    flexDirection='column'
    gap={3}
    alignItems='flex-start'
    width='full'
  >
    <Text as='h2' fontSize='xl' fontWeight='bold'>
      {title}
    </Text>

    {children}
  </Flex>
);

export const LegalSubtitle = ({ children }: { children: React.ReactNode }) => (
  <Text as='h3' fontSize='md' fontWeight='bold' marginTop={2}>
    {children}
  </Text>
);

export const LegalText = ({ children }: { children: React.ReactNode }) => (
  <Text as='p' fontSize='sm' lineHeight='tall' opacity={0.9}>
    {children}
  </Text>
);

export const LegalList = ({ children }: { children: React.ReactNode }) => (
  <Box
    as='ul'
    listStyleType='disc'
    listStylePosition='outside'
    paddingLeft={5}
    display='flex'
    flexDirection='column'
    gap={2}
  >
    {children}
  </Box>
);

export const LegalItem = ({ children }: { children: React.ReactNode }) => (
  <Box as='li' fontSize='sm' lineHeight='tall' opacity={0.9}>
    {children}
  </Box>
);

export const LegalEmail = ({ email, children }: { email: string; children?: React.ReactNode }) => (
  <ChakraLink href={`mailto:${email}`} fontWeight='bold' textDecoration='underline'>
    {children ?? email}
  </ChakraLink>
);

export const LegalLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <ChakraLink asChild fontWeight='bold' textDecoration='underline'>
    <NextLink href={href}>{children}</NextLink>
  </ChakraLink>
);

export const LegalFinalNotice = ({ children }: { children: React.ReactNode }) => (
  <Box
    as='section'
    width='full'
    borderTopWidth='1px'
    borderColor={{ base: 'gray.200', _dark: 'whiteAlpha.300' }}
    paddingTop={8}
  >
    <Text as='p' fontSize='sm' lineHeight='tall' fontWeight='medium'>
      {children}
    </Text>
  </Box>
);
