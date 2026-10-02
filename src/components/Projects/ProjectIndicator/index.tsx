'use client';

import { Box, BoxProps } from '@chakra-ui/react';
import { useProjectsStore } from '@/stores/Projects.store';
import {
  PROJECT_INDICATOR_HEIGHT,
  PROJECT_INDICATOR_THICKNESS,
  PROJECT_PALETTE,
} from '@/constants/Projects';

interface ProjectIndicatorProps extends BoxProps {
  projectId?: string | null;
}

export const ProjectIndicator = ({ projectId, ...rest }: ProjectIndicatorProps) => {
  const color = useProjectsStore((state) =>
    state.activeProjectId || !projectId
      ? undefined
      : state.projects.find((item) => item.id === projectId)?.color
  );

  if (!color) return null;

  const palette = PROJECT_PALETTE[color];

  return (
    <Box
      data-pw-id='project-indicator'
      aria-hidden
      position='absolute'
      right='0'
      bottom='0'
      width={PROJECT_INDICATOR_THICKNESS}
      height={PROJECT_INDICATOR_HEIGHT}
      pointerEvents='none'
      bg={{ base: palette.accent, _dark: palette.accentDark }}
      borderBottomRightRadius='inherit'
      {...rest}
    />
  );
};
