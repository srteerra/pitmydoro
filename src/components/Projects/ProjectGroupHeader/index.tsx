'use client';

import { HStack, Separator, StackProps, Text } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { Project } from '@/interfaces/Project.interface';
import { useResolveProjectName } from '@/hooks/useProjects';
import { ProjectColorDot } from '@/components/Projects/ProjectColorDot';

interface ProjectGroupHeaderProps extends StackProps {
  project: Project | null;
}

export const ProjectGroupHeader = ({ project, ...rest }: ProjectGroupHeaderProps) => {
  const t = useTranslations('projects');
  const resolveName = useResolveProjectName();

  return (
    <HStack data-pw-id='project-group-header' gap={2} width='100%' minWidth={0} {...rest}>
      {project && <ProjectColorDot color={project.color} />}
      <Text
        fontSize='xs'
        fontWeight='semibold'
        textTransform='uppercase'
        letterSpacing='wide'
        color={{ base: 'gray.500', _dark: 'gray.400' }}
        truncate
      >
        {project ? resolveName(project) : t('none')}
      </Text>
      <Separator flex='1' />
    </HStack>
  );
};
