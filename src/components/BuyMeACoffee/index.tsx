'use client';

import { Box, Link as ChakraLink, Text } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { BMC_SLUG } from '@/constants/Site';

const BMC_URL = `https://www.buymeacoffee.com/${BMC_SLUG}`;

export const BuyMeACoffee = () => {
  const t = useTranslations('footer');

  return (
    <ChakraLink
      href={BMC_URL}
      target='_blank'
      rel='noopener noreferrer'
      aria-label={t('support')}
      data-pw-id='bmc-button'
      display='inline-flex'
      alignItems='center'
      gap={2.5}
      height='46px'
      paddingX={5}
      rounded='lg'
      backgroundColor='#FFDD00'
      borderWidth='1px'
      borderColor='#000000'
      boxShadow='0 2px 0 0 #000000'
      textDecoration='none'
      transition='transform 0.15s ease, box-shadow 0.15s ease'
      _hover={{
        textDecoration: 'none',
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 0 0 #000000',
      }}
      _active={{ transform: 'translateY(0)', boxShadow: '0 1px 0 0 #000000' }}
    >
      <Box as='span' fontSize='xl' lineHeight='1' aria-hidden='true'>
        ☕
      </Box>

      <Text
        as='span'
        color='#000000'
        fontWeight='semibold'
        fontSize='md'
        fontFamily="'Bree Serif', 'Poppins Regular', Georgia, serif"
        whiteSpace='nowrap'
      >
        Buy me a coffee
      </Text>
    </ChakraLink>
  );
};
