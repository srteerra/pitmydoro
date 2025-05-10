import { ToggleMode } from "@/components/Toggles/ThemeMode";
import { Center, HStack, Image } from "@chakra-ui/react";
import React from "react";
import NextImage from "next/image";
import Logo from "../../../public/images/pitmydoro.png";
import { LocaleSwitch } from "@/components/Toggles/LocaleSwitch";

export const Header = () => {
  return (
    <HStack justifyContent={"center"} alignItems={"center"} gap={4} paddingY={12}>
      <LocaleSwitch />

      <Center>
        <Image
          asChild
          filter="none"
          alt={"..."}
          _dark={{ filter: 'invert(1)' }}
        >
          <NextImage width={250} src={Logo} alt="..." />
        </Image>
      </Center>

      <ToggleMode />
    </HStack>
  )
}