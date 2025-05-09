import { Center, Text, VStack } from "@chakra-ui/react";

export const Footer = () => {
  return (
    <Center as={"footer"} paddingY={12} gap={4}>
      <VStack>
        <Text fontSize={"sm"} color={"gray.500"}>
          &copy; {new Date().getFullYear()} Pit my doro
        </Text>
        <Text fontSize={"sm"} color={"gray.500"}>
          Made with ❤️ by @srteerra
        </Text>
      </VStack>
    </Center>
  );
}