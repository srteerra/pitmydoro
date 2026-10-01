'use client';

import { useMemo } from 'react';
import { HStack, Text, VStack } from '@chakra-ui/react';
import { LuCirclePlus } from 'react-icons/lu';
import { useTranslations } from 'next-intl';
import { Project } from '@/interfaces/Project.interface';
import { useProjectsStore } from '@/stores/Projects.store';
import { useProjects, useResolveProjectName } from '@/hooks/useProjects';
import { ProjectColorDot } from '@/components/Projects/ProjectColorDot';
import { PinButton } from '@/components/PinButton';
import { SortableList } from '@/components/SortableList';
import { ZoneButton } from '@/components/Pomodoro/components/ZoneButton';
import { sortPinnedFirst } from '@/utils/pin.utils';
import { PROJECTS_LIST_ACTION_OPACITY, PROJECTS_LIST_COLORS } from '@/constants/Projects';

const ACTION_BUTTON_STYLE = {
  size: 'xs',
  rounded: 'full',
  opacity: PROJECTS_LIST_ACTION_OPACITY,
  transition: 'opacity 0.2s ease',
  _hover: { opacity: 1, bg: { base: 'blackAlpha.100', _dark: 'whiteAlpha.200' } },
  _focusVisible: { opacity: 1 },
  _groupHover: {},
} as const;

interface ProjectsListProps {
  onEdit: (project: Project) => void;
  onAdd: () => void;
}

interface ProjectRowProps {
  project: Project;
  selected: boolean;
  onEdit: (project: Project) => void;
}

const ProjectRow = ({ project, selected, onEdit }: ProjectRowProps) => {
  const t = useTranslations('projects');
  const resolveName = useResolveProjectName();
  const { togglePin } = useProjects();

  return (
    <HStack className='group' gap={1} paddingX={2} rounded='md' bg={PROJECTS_LIST_COLORS.card}>
      <SortableList.DragHandle />

      <HStack
        as='button'
        data-pw-id={`projects-list-item-${project.id}`}
        onClick={() => onEdit(project)}
        flex='1'
        minWidth={0}
        gap={3}
        paddingY={3}
        cursor='pointer'
        textAlign='left'
      >
        <ProjectColorDot color={project.color} size='12px' />
        <VStack align='stretch' gap={0} minWidth={0} flex='1'>
          <Text fontSize='sm' fontWeight={selected ? 'bold' : 'semibold'} truncate>
            {resolveName(project)}
          </Text>
          <Text fontSize='xs' opacity={project.description ? 0.6 : 0.4} truncate>
            {project.description || t('noDescription')}
          </Text>
        </VStack>
      </HStack>

      <PinButton
        {...ACTION_BUTTON_STYLE}
        opacity={project.pinned ? 1 : PROJECTS_LIST_ACTION_OPACITY}
        pinned={!!project.pinned}
        label={project.pinned ? t('unpin') : t('pin')}
        testId={`projects-list-pin-${project.id}`}
        onToggle={() => void togglePin(project)}
      />
    </HStack>
  );
};

export const ProjectsList = ({ onEdit, onAdd }: ProjectsListProps) => {
  const t = useTranslations('projects');
  const projects = useProjectsStore((state) => state.projects);
  const activeProjectId = useProjectsStore((state) => state.activeProjectId);
  const { reorderProjects } = useProjects();
  const sortedProjects = useMemo(() => sortPinnedFirst(projects), [projects]);

  return (
    <VStack align='stretch' gap={2} data-pw-id='projects-list'>
      <Text fontSize='sm' opacity={0.7}>
        {t('description')}
      </Text>

      <SortableList
        items={sortedProjects}
        onChange={(ordered) => void reorderProjects(ordered)}
        renderItem={(project) => (
          <SortableList.Item id={project.id}>
            <ProjectRow
              project={project}
              selected={project.id === activeProjectId}
              onEdit={onEdit}
            />
          </SortableList.Item>
        )}
      />

      {!sortedProjects.length && (
        <Text fontSize='xs' opacity={0.6} paddingX={3} paddingY={2}>
          {t('empty')}
        </Text>
      )}

      <ZoneButton
        data-pw-id='projects-list-add'
        fontWeight='semibold'
        size='sm'
        marginTop={4}
        onClick={onAdd}
      >
        <LuCirclePlus size={25} />
        {t('add')}
      </ZoneButton>
    </VStack>
  );
};
