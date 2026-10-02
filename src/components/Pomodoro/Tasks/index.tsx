import { HStack, Separator, Spinner, Text } from '@chakra-ui/react';
import React, { useMemo, useState } from 'react';
import { Task } from '@/interfaces/Task.interface';
import { ZoneButton } from '../components/ZoneButton';
import { LuCirclePlus } from 'react-icons/lu';
import { useTranslations } from 'next-intl';
import { useTasks } from '@/hooks/useTasks';
import { useTaskStore } from '@/stores/Tasks.store';
import _ from 'lodash';
import { usePomodoro } from '@/hooks/usePomodoro';
import { useAlert } from '@/hooks/useAlert';
import { useArchivedTasks } from '@/hooks/useArchivedTasks';
import { useProjectsStore } from '@/stores/Projects.store';
import { belongsToProject, filterByProject } from '@/utils/projects.utils';
import { matchesTaskView } from '@/utils/taskView.utils';
import { TaskViewEnum } from '@/enums/TaskView.enum';
import { useResolveProjectName } from '@/hooks/useProjects';
import { TasksToolbar } from '@/components/Pomodoro/Tasks/TasksToolbar';
import { TaskList } from '@/components/Pomodoro/Tasks/TaskList';

export const Tasks = () => {
  const { loading, handleAddTask, handleReorderTasks, archiveCompletedTasks } = useTasks();
  const { switchTask } = usePomodoro();
  const { confirmAlert, toastSuccess } = useAlert();
  const tasks = useTaskStore((state) => state.tasks);
  const editingTask = useTaskStore((state) => state.editingTask);
  const setEditingTask = useTaskStore((state) => state.setEditingTask);
  const activeProjectId = useProjectsStore((state) => state.activeProjectId);
  const activeProject = useProjectsStore((state) =>
    state.projects.find((project) => project.id === state.activeProjectId)
  );
  const resolveProjectName = useResolveProjectName();
  const [view, setView] = useState<TaskViewEnum>(TaskViewEnum.PENDING);
  const isArchivedView = view === TaskViewEnum.ARCHIVED;
  const { archivedTasks, loading: archivedLoading } = useArchivedTasks(isArchivedView);
  const t = useTranslations('pomodoro.tasks');

  const activeTasks = useMemo(() => tasks.filter((t) => !t.archive), [tasks]);

  const sortedTasks = useMemo(() => {
    return _.sortBy(activeTasks, 'order');
  }, [activeTasks]);

  const projectTasks = useMemo(
    () => filterByProject(sortedTasks, activeProjectId),
    [sortedTasks, activeProjectId]
  );

  const completedCount = useMemo(
    () => projectTasks.filter((task) => !!task.completedAt).length,
    [projectTasks]
  );

  const visibleTasks = useMemo(() => {
    if (isArchivedView) return filterByProject(archivedTasks, activeProjectId);

    return sortedTasks.filter(
      (task) =>
        (belongsToProject(task, activeProjectId) && matchesTaskView(task, view)) ||
        task.id === editingTask
    );
  }, [isArchivedView, archivedTasks, sortedTasks, activeProjectId, view, editingTask]);

  const handleTaskClick = async (task: Task) => {
    if (!editingTask) {
      await switchTask(task);
    } else {
      if (activeTasks?.length && activeTasks.some((t) => !t.title)) return;
      setEditingTask(null);
      await switchTask(task);
    }
  };

  const handleArchiveCompleted = async () => {
    if (!(await confirmAlert(t('archiveCompletedConfirm'), { type: 'danger' }))) return;

    const archivedCount = await archiveCompletedTasks();
    if (archivedCount) toastSuccess(t('archiveCompletedSuccess', { count: archivedCount }));
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <React.Fragment>
      <HStack margin={'40px 0 20px'} display='flex' justifyContent='center'>
        <Separator flex='1' />
        <Text fontSize={'sm'} minWidth={0} truncate>
          {activeProject
            ? t.rich('titleInProject', {
                name: resolveProjectName(activeProject),
                bold: (chunks) => (
                  <Text as='span' fontWeight='bold'>
                    {chunks}
                  </Text>
                ),
              })
            : t('title')}
        </Text>
        <Separator flex='1' />
      </HStack>

      <TasksToolbar
        view={view}
        pendingCount={projectTasks.length - completedCount}
        completedCount={completedCount}
        onViewChange={setView}
        onArchiveCompleted={() => void handleArchiveCompleted()}
      />

      {isArchivedView && archivedLoading && !visibleTasks.length && <Spinner size='sm' />}

      {view !== TaskViewEnum.PENDING && !visibleTasks.length && !archivedLoading && (
        <Text
          data-pw-id='tasks-empty'
          width='100%'
          textAlign='center'
          fontSize='sm'
          color='gray.400'
          paddingY={4}
        >
          {activeProject
            ? t(`empty.${view}InProject`, { name: resolveProjectName(activeProject) })
            : t(`empty.${view}`)}
        </Text>
      )}

      <TaskList
        tasks={visibleTasks}
        allTasks={sortedTasks}
        archived={isArchivedView}
        onReorder={handleReorderTasks}
        onTaskClick={handleTaskClick}
      />

      {view === TaskViewEnum.PENDING && (
        <ZoneButton
          isDisabled={!!editingTask}
          onClick={() => {
            handleAddTask();
          }}
          fontWeight={'semibold'}
          data-pw-id={'addTask-button'}
          size={'sm'}
          mt={6}
        >
          <LuCirclePlus size={25} />
          {t('addTask')}
        </ZoneButton>
      )}
    </React.Fragment>
  );
};
