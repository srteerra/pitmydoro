import React from 'react';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { Center, Text, Link, Box } from '@chakra-ui/react';
import { IoIosConstruct } from 'react-icons/io';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/*TO DO: Remove this when the platform is on a stable version*/}
      <Box
        width={'full'}
        bgColor={'black'}
        flexDirection={'column'}
        alignItems={'center'}
        justifyContent={'center'}
        color={'white'}
        paddingY={5}
      >
        <Center flexWrap={'wrap'} gap={3}>
          <IoIosConstruct size={25} />
          <Text>
            The platform is under daily active development. Bugs may occur—please be patient and
            report any issues to{' '}
            <Link
              href='mailto:srterradev@gmail.com'
              color={'blue.400'}
              textDecoration={'underline'}
            >
              contact@pitmydoro.com
            </Link>
          </Text>
        </Center>

        <Center>
          <Text as={'small'}>
            Last update:{' '}
            {new Date().toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
              day: 'numeric',
            })}
          </Text>
        </Center>
      </Box>

      <Header />
      {children}
      <Footer />
    </>
  );
}
