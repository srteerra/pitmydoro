'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, IconButton, Text, useMediaQuery, VStack } from '@chakra-ui/react';
import { LuFolder, LuLayoutGrid, LuPlus, LuSettings2 } from 'react-icons/lu';
import { useTranslations } from 'next-intl';
import { Project } from '@/interfaces/Project.interface';
import { createProject, useProjectsStore } from '@/stores/Projects.store';
import { useProjects, useResolveProjectName } from '@/hooks/useProjects';
import { useNeutralTabPalette } from '@/hooks/useNeutralTabPalette';
import { useStartButtonColors } from '@/hooks/useStartButtonColors';
import { useDrawer } from '@/contexts/DrawerContext';
import { ProjectTab } from '@/components/Projects/ProjectTab';
import { ProjectsList } from '@/components/Projects/ProjectsList';
import { ProjectEditor } from '@/components/Projects/ProjectEditor';
import { Tooltip } from '@/components/ui/tooltip';
import { STICKY_NOTE_STACK_GAP, STICKY_NOTE_STACK_TOP } from '@/constants/StickyNotes';
import {
  PROJECT_DEFAULT_COLOR,
  PROJECT_PALETTE,
  PROJECT_SQUARE_TABS,
  PROJECT_TAB_HEIGHT,
  PROJECT_TAB_SQUARE_HEIGHT,
  PROJECTS_LIST_COLORS,
} from '@/constants/Projects';
import { sortPinnedFirst } from '@/utils/pin.utils';
import { TAB_SLIDE_IN_STAGGER_MS } from '@/constants/Animations';
import { ACTIVE_GENERAL_TAB_TEXT_COLOR } from '@/constants/TabColors';

const TOOLTIP_POSITIONING = { placement: 'left', offset: { mainAxis: 12, crossAxis: 0 } } as const;

export const Projects = () => {
  const t = useTranslations('projects');
  const resolveName = useResolveProjectName();
  const neutralPalette = useNeutralTabPalette('projects');
  const { buttonColor } = useStartButtonColors();
  const { selectProject, toggleProject, togglePin } = useProjects();
  const projects = useProjectsStore((state) => state.projects);
  const activeProjectId = useProjectsStore((state) => state.activeProjectId);
  const { openDrawer, closeDrawer } = useDrawer();
  const [isDesktop] = useMediaQuery(['(min-width: 64em)'], { fallback: [false] });
  const [mounted, setMounted] = useState(false);
  const [cardHeight, setCardHeight] = useState(0);
  const stackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const card = stackRef.current?.parentElement;
    if (!card) return;

    const observer = new ResizeObserver(([entry]) => setCardHeight(entry.contentRect.height));
    observer.observe(card);

    return () => observer.disconnect();
  }, [mounted, isDesktop]);

  const sortedProjects = useMemo(() => sortPinnedFirst(projects), [projects]);
  const generalPalette = useMemo(() => {
    if (activeProjectId) return neutralPalette;

    return {
      ...neutralPalette,
      surface: buttonColor,
      surfaceDark: buttonColor,
      swatch: buttonColor,
      text: ACTIVE_GENERAL_TAB_TEXT_COLOR,
      textDark: ACTIVE_GENERAL_TAB_TEXT_COLOR,
    };
  }, [activeProjectId, neutralPalette, buttonColor]);
  const activeProject = sortedProjects.find((project) => project.id === activeProjectId);

  const squaresHeight = PROJECT_SQUARE_TABS * (PROJECT_TAB_SQUARE_HEIGHT + STICKY_NOTE_STACK_GAP);
  const availableHeight = cardHeight - STICKY_NOTE_STACK_TOP - squaresHeight;
  const capacity = Math.max(
    0,
    Math.floor(availableHeight / (PROJECT_TAB_HEIGHT + STICKY_NOTE_STACK_GAP))
  );
  const visibleProjects = sortedProjects.slice(0, capacity);
  const hiddenCount = sortedProjects.length - visibleProjects.length;

  const drawerLayout = {
    placement: isDesktop ? 'start' : 'bottom',
    size: isDesktop ? 'sm' : 'lg',
    offset: 4,
  } as const;

  const openProjectEditor = (project: Project, isNew = false) => {
    openDrawer({
      ...drawerLayout,
      topTitle: { label: t(isNew ? 'add' : 'edit'), icon: <LuFolder /> },
      component: (
        <ProjectEditor
          key={project.id}
          project={project}
          isNew={isNew}
          onDone={closeDrawer}
          onBack={openProjectsList}
        />
      ),
    });
  };

  const handleAdd = () => openProjectEditor(createProject(projects), true);

  const openProjectsList = () => {
    openDrawer({
      ...drawerLayout,
      background: PROJECTS_LIST_COLORS.drawer,
      topTitle: { label: t('all'), icon: <LuFolder /> },
      component: (
        <ProjectsList onEdit={(project) => openProjectEditor(project)} onAdd={handleAdd} />
      ),
    });
  };

  if (!mounted) return null;

  const fabPalette = PROJECT_PALETTE[activeProject?.color ?? PROJECT_DEFAULT_COLOR];

  return (
    <>
      <VStack
        ref={stackRef}
        data-pw-id='projects-stack'
        position='absolute'
        top={`${STICKY_NOTE_STACK_TOP}px`}
        left='0'
        zIndex={0}
        gap={`${STICKY_NOTE_STACK_GAP}px`}
        alignItems='flex-start'
        display={{ base: 'none', lg: 'flex' }}
      >
        <Tooltip
          openDelay={100}
          closeDelay={100}
          content={t('general')}
          positioning={TOOLTIP_POSITIONING}
        >
          <ProjectTab
            ariaLabel={t('general')}
            aria-pressed={!activeProjectId}
            height={PROJECT_TAB_SQUARE_HEIGHT}
            palette={generalPalette}
            icon={
              <Box as='span' display='flex' opacity={activeProjectId ? 0.45 : 1}>
                <LuLayoutGrid />
              </Box>
            }
            pullOnHover={false}
            testId='project-tab-general'
            onClick={() => selectProject(null)}
          />
        </Tooltip>

        {visibleProjects.map((project, index) => (
          <ProjectTab
            key={project.id}
            label={resolveName(project)}
            ariaLabel={t('open', { name: resolveName(project) })}
            color={project.color}
            active={project.id === activeProjectId}
            dimmed={project.id !== activeProjectId}
            pinned={!!project.pinned}
            pinLabel={project.pinned ? t('unpin') : t('pin')}
            testId={`project-tab-${project.id}`}
            entryDelay={(index + 1) * TAB_SLIDE_IN_STAGGER_MS}
            onClick={() => toggleProject(project.id)}
            onTogglePin={() => void togglePin(project)}
          />
        ))}

        {sortedProjects.length > 0 && (
          <Tooltip
            openDelay={100}
            closeDelay={100}
            content={t('manage')}
            positioning={TOOLTIP_POSITIONING}
          >
            <ProjectTab
              ariaLabel={t('manage')}
              height={PROJECT_TAB_SQUARE_HEIGHT}
              palette={neutralPalette}
              dimmed
              icon={
                hiddenCount ? (
                  <Text fontSize='sm' fontWeight='semibold'>{`+${hiddenCount}`}</Text>
                ) : (
                  <LuSettings2 />
                )
              }
              pullOnHover={false}
              testId='project-tab-manage'
              entryDelay={(visibleProjects.length + 1) * TAB_SLIDE_IN_STAGGER_MS}
              onClick={openProjectsList}
            />
          </Tooltip>
        )}

        <Tooltip
          openDelay={100}
          closeDelay={100}
          content={t('add')}
          positioning={TOOLTIP_POSITIONING}
        >
          <ProjectTab
            ariaLabel={t('add')}
            height={PROJECT_TAB_SQUARE_HEIGHT}
            palette={neutralPalette}
            dimmed
            icon={<LuPlus />}
            pullOnHover={false}
            testId='project-tab-add'
            entryDelay={(visibleProjects.length + 2) * TAB_SLIDE_IN_STAGGER_MS}
            onClick={handleAdd}
          />
        </Tooltip>
      </VStack>

      <Box display={{ base: 'block', lg: 'none' }}>
        <IconButton
          data-pw-id='projects-fab'
          aria-label={t('all')}
          onClick={openProjectsList}
          position='fixed'
          left='0'
          top='45%'
          zIndex={1001}
          borderRightRadius='md'
          borderLeftRadius='none'
          size='lg'
          shadow='3px 5px 12px rgba(0, 0, 0, 0.18)'
          bg={{ base: fabPalette.swatch, _dark: fabPalette.surfaceDark }}
          color={{ base: fabPalette.text, _dark: fabPalette.textDark }}
          _hover={{ bg: { base: fabPalette.accent, _dark: fabPalette.accentDark } }}
        >
          <LuFolder />
        </IconButton>
      </Box>
    </>
  );
};
