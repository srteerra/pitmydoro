import React from 'react';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { Center, Text, Link } from '@chakra-ui/react';
import { IoIosConstruct } from 'react-icons/io';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/*TO DO: Remove this when the platform is on a stable version*/}
      <Center paddingY={5} bgColor={'black'} flexWrap={'wrap'} gap={3} color={'white'}>
        <IoIosConstruct size={25} />
        <Text>
          The platform is under daily active development. Bugs may occur—please be patient and
          report any issues to{' '}
          <Link href='mailto:srterradev@gmail.com' color={'blue.400'} textDecoration={'underline'}>
            srterradev@gmail.com
          </Link>
        </Text>
      </Center>

      <Header />
      {children}
      <Footer />
    </>
  );
}
