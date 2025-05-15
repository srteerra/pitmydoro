import { chakra, defineSlotRecipe, useSlotRecipe } from '@chakra-ui/react';
import React from 'react';

interface RippleButtonProps {
  size?: 'sm' | 'md';
  isActive?: boolean;
  children: React.ReactNode;
  buttonColor?: string;
  spanColor?: string;
  textColor?: string;
  [key: string]: any;
}

const rippleButton = defineSlotRecipe({
  slots: ['button', 'span'],
  base: {
    button: {
      background: 'hsl(340deg 100% 32%)',
      borderRadius: '12px',
      border: 'none',
      padding: '0',
      cursor: 'pointer',
      outlineOffset: '4px',
      display: 'inline-block',
      position: 'relative',
      _focus: { outline: 'none' },
      "&[data-active='true'] span": {
        transform: 'translateY(-2px)',
      },
    },
    span: {
      display: 'flex',
      justifyContent: 'center',
      textAlign: 'center',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 42px',
      borderRadius: '12px',
      fontSize: '1.25rem',
      background: 'hsl(345deg 100% 47%)',
      color: 'white',
      transform: 'translateY(-6px)',
      transition: 'transform 0.2s',
      _active: {
        transform: 'translateY(-2px)',
      },
    },
  },
  variants: {
    size: {
      sm: {
        span: {
          padding: '10px 25px',
          fontSize: 'sm',
        },
      },
      md: {
        span: {
          padding: '10px 30px',
          fontSize: 'md',
        },
      },
    },
  },
});

export const RippleButton: React.FC<RippleButtonProps> = (props) => {
  const { size, isActive, children, buttonColor, spanColor, textColor, ...rest } = props;

  const recipe = useSlotRecipe({ recipe: rippleButton });
  const styles = recipe({ size });
  const dynamicButtonStyles = { background: buttonColor || styles.button.background };
  const dynamicSpanStyles = {
    background: spanColor || styles.span.background,
    color: textColor || styles.span.color,
  };

  return (
    <chakra.button
      css={{ ...styles.button, ...dynamicButtonStyles }}
      data-active={isActive ? 'true' : 'false'}
      {...rest}
    >
      <chakra.span css={{ ...styles.span, ...dynamicSpanStyles }}>{children}</chakra.span>
    </chakra.button>
  );
};
