import React from 'react';
import { Box } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

interface SpriteAnimationProps {
  src: string;
  frameWidth: number;
  frameHeight: number;
  totalFrames: number;
  frameRate?: number;
  paused?: boolean;
}

export const SpriteAnimation: React.FC<SpriteAnimationProps> = ({
  src,
  frameWidth,
  frameHeight,
  totalFrames,
  frameRate = 9,
  paused = false,
}) => {
  const totalDuration = totalFrames / frameRate;
  const spriteWidth = frameWidth * totalFrames;

  const slideAnimation = keyframes`
      from {
          background-position: 0 0;
      }
      to {
          background-position: -${spriteWidth}px 0;
      }
  `;

  return (
    <Box
      w={`${frameWidth}px`}
      h={`${frameHeight}px`}
      bgImage={`url(${src})`}
      zIndex="2"
      bgSize={`${spriteWidth}px ${frameHeight}px`}
      backgroundPosition={paused ? '0 0' : undefined}
      animation={
        paused ? 'none' : `${slideAnimation} ${totalDuration}s steps(${totalFrames}) infinite`
      }
    />
  );
};
