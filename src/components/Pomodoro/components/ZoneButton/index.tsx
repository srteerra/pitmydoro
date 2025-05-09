import { chakra, defineSlotRecipe, useSlotRecipe } from "@chakra-ui/react";
import React from "react";

interface RippleButtonProps {
  isDisabled?: boolean;
  size?: "sm" | "md";
  isActive?: boolean;
  children: React.ReactNode;
  [key: string]: any;
}

const zoneButton = defineSlotRecipe({
  slots: ["button"],
  base: {
    button: {
      background: { base: "rgba(243,243,243,0.56)", md: "#f1f1f1", _dark: "rgba(45,45,45,0.68)" },
      borderRadius: "5px",
      borderWidth: "2px",
      borderStyle: "dashed",
      borderColor: { base: "#bbbbbb", _dark: "#606060" },
      fontSize: "md",
      color: { base: "#bbbbbb", _dark: "#606060" },
      padding: "10px 30px",
      cursor: "pointer",
      width: "100%",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      gap: "8px",
      transition: "0.3s",
      _hover: {
        opacity: 0.8,
      },
      _disabled: {
        opacity: 0.5,
        cursor: "not-allowed",
      }
    },
  },
  variants: {
    size: {
      sm: {
        button: {
          padding: "10px 25px",
          fontSize: "sm",
        },
      },
      md: {
        button: {
          padding: "10px 30px",
          fontSize: "md",
        },
      },
    },
  },
})

export const ZoneButton: React.FC<RippleButtonProps> = (props) => {
  const { size, isActive, children, isDisabled, ...rest } = props;

  const recipe = useSlotRecipe({ recipe: zoneButton })
  const styles = recipe({ size })

  return (
    <chakra.button
      disabled={isDisabled}
      css={styles.button}
      data-active={isActive ? "true" : "false"}
      {...rest}
    >
      {children}
    </chakra.button>
  );
};
