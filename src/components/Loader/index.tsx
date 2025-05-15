import { Box, Center } from '@chakra-ui/react';
import './styles.css';

export const Loader = () => {
  return (
    <Center
      position={'fixed'}
      top={'0'}
      left={'0'}
      bgColor={'gray.900'}
      height='100vh'
      width='100vw'
    >
      <Box className={'bars-6'}></Box>
    </Center>
  );
};
