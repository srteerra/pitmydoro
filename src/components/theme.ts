import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  globalCss: {
    body: {
      fontFamily: "'Poppins', sans-serif",
      backgroundColor: { base: "{colors.background.light}", _dark: "{colors.background.dark}" },
    },
  },
  theme: {
    keyframes: {
      slideDown: {
        "0%": { transform: "translateY(-100%)", opacity: 0 },
        "100%": { transform: "translateY(0)", opacity: 1 }
      },
    },
    tokens: {
      animations: {
        slideDown: { value: "slideDown 1s ease-in-out" },
      },
      colors: {
        background: {
          light: { value: "#FFF3E2" },
          dark: { value: "#171717" },
        },
        light: {
          0: { value: "#FFFFFF" },
          50: { value: "#F8F8F8" },
          100: { value: "#FAFAFA" },
          150: { value: "#EFEFEF" },
        },
        dark: {
          50: { value: "#000000" },
          100: { value: "#0A0A0A" },
          200: { value: "#171717" },
          300: { value: "#262626" },
          400: { value: "#373737" },
          500: { value: "#525252" },
        },
        primary: {
          default: { value: "#486192" },
          contrast: { value: "#2a4270" },
        }
      },
    },
    semanticTokens: {
      fonts: {
        body: { value: "'Poppins', sans-serif" },
        heading: { value: "'Poppins', sans-serif" },
      },
      colors: {
        background: {
          solid: { value: "{colors.background.50}" },
          contrast: { value: "{colors.background.100}" },
          fg: { value: "{colors.background.400}" },
          muted: { value: "{colors.background.100}" },
          subtle: { value: "{colors.background.200}" },
          emphasized: { value: "{colors.background.300}" },
          focusRing: { value: "{colors.background.400}" },
        }
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)