"use client"

import { IconButton } from "@chakra-ui/react"
import { useTheme } from "next-themes"
import { LuMoon, LuSun } from "react-icons/lu"

export function ToggleMode() {
  const { theme, setTheme } = useTheme()
  const toggleColorMode = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }
  return (
    <IconButton variant={"ghost"} rounded="full" onClick={toggleColorMode}>
      {theme === "light" ? <LuMoon /> : <LuSun />}
    </IconButton>
  )
}