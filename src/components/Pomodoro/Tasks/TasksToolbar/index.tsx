'use client';

import { Group, HStack, IconButton, SegmentGroup, Text } from '@chakra-ui/react';
import { LuList, LuTag } from 'react-icons/lu';
import { HiDotsVertical } from 'react-icons/hi';
import { MdOutlineRestoreFromTrash } from 'react-icons/md';
import { useTranslations } from 'next-intl';
import { TaskViewEnum } from '@/enums/TaskView.enum';
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from '@/components/ui/menu';
import { useProjectsStore } from '@/stores/Projects.store';

interface TasksToolbarProps {
  view: TaskViewEnum;
  pendingCount: number;
  completedCount: number;
  onViewChange: (view: TaskViewEnum) => void;
  onArchiveCompleted: () => void;
}

export const TasksToolbar = ({
  view,
  pendingCount,
  completedCount,
  onViewChange,
  onArchiveCompleted,
}: TasksToolbarProps) => {
  const t = useTranslations('pomodoro.tasks');
  const groupByProject = useProjectsStore((state) => state.groupByProject);
  const setGroupByProject = useProjectsStore((state) => state.setGroupByProject);

  const views = [
    { value: TaskViewEnum.PENDING, label: t('views.pending'), count: pendingCount },
    { value: TaskViewEnum.COMPLETED, label: t('views.completed'), count: completedCount },
    { value: TaskViewEnum.ARCHIVED, label: t('views.archived') },
  ];

  return (
    <HStack data-pw-id='tasks-toolbar' width='100%' gap={2} marginBottom={4}>
      <Group attached flexShrink={0} role='group' aria-label={t('listLayout')}>
        <IconButton
          data-pw-id='tasks-layout-list'
          aria-label={t('flatList')}
          aria-pressed={!groupByProject}
          size='sm'
          variant={groupByProject ? 'ghost' : 'subtle'}
          onClick={() => setGroupByProject(false)}
        >
          <LuList />
        </IconButton>
        <IconButton
          data-pw-id='tasks-layout-grouped'
          aria-label={t('groupByProject')}
          aria-pressed={groupByProject}
          size='sm'
          variant={groupByProject ? 'subtle' : 'ghost'}
          onClick={() => setGroupByProject(true)}
        >
          <LuTag />
        </IconButton>
      </Group>

      <SegmentGroup.Root
        size='sm'
        flex='1'
        minWidth={0}
        value={view}
        onValueChange={(details) => onViewChange(details.value as TaskViewEnum)}
      >
        <SegmentGroup.Indicator />
        {views.map((item) => (
          <SegmentGroup.Item
            key={item.value}
            value={item.value}
            flex='1'
            justifyContent='center'
            cursor='pointer'
            data-pw-id={`tasks-view-${item.value}`}
          >
            <SegmentGroup.ItemText truncate>
              {item.label}
              {item.count !== undefined && (
                <Text
                  as='span'
                  marginLeft={1}
                  fontWeight='normal'
                  color={{ base: 'gray.400', _dark: 'gray.500' }}
                >
                  ({item.count})
                </Text>
              )}
            </SegmentGroup.ItemText>
            <SegmentGroup.ItemHiddenInput />
          </SegmentGroup.Item>
        ))}
      </SegmentGroup.Root>

      {view === TaskViewEnum.COMPLETED && (
        <MenuRoot positioning={{ placement: 'bottom-end' }}>
          <MenuTrigger asChild>
            <IconButton
              data-pw-id='tasks-toolbar-menu'
              aria-label={t('listOptions')}
              variant='ghost'
              size='sm'
              flexShrink={0}
            >
              <HiDotsVertical />
            </IconButton>
          </MenuTrigger>
          <MenuContent>
            <MenuItem
              value='archive-completed'
              cursor={completedCount ? 'pointer' : 'not-allowed'}
              disabled={!completedCount}
              onClick={completedCount ? onArchiveCompleted : undefined}
              data-pw-id='tasks-archive-completed'
            >
              <MdOutlineRestoreFromTrash />
              {t('archiveCompleted')}
            </MenuItem>
          </MenuContent>
        </MenuRoot>
      )}
    </HStack>
  );
};
