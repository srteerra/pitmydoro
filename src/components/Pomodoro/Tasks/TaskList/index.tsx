'use client';

import { useMemo } from 'react';
import { VStack } from '@chakra-ui/react';
import { Task } from '@/interfaces/Task.interface';
import { SortableList } from '@/components/SortableList';
import { TaskCard } from '@/components/Pomodoro/Tasks/TaskCard';
import { ProjectGroupHeader } from '@/components/Projects/ProjectGroupHeader';
import { useProjectsStore } from '@/stores/Projects.store';
import { groupItemsByProject, mergeSubsetOrder } from '@/utils/projects.utils';

interface TaskListProps {
  tasks: Task[];
  allTasks: Task[];
  archived?: boolean;
  onReorder: (orderedTasks: Task[]) => void;
  onTaskClick: (task: Task) => void;
}

interface TaskSectionProps extends TaskListProps {
  sectionTasks: Task[];
}

const TaskSection = ({
  sectionTasks,
  allTasks,
  archived,
  onReorder,
  onTaskClick,
}: TaskSectionProps) => {
  if (archived) {
    return (
      <VStack gap={3} width='100%'>
        {sectionTasks.map((task) => (
          <TaskCard key={task.id} task={task} archived />
        ))}
      </VStack>
    );
  }

  return (
    <SortableList
      items={sectionTasks}
      onChange={(reordered) => onReorder(mergeSubsetOrder(allTasks, reordered))}
      renderItem={(task) => (
        <SortableList.Item id={task.id}>
          <TaskCard
            task={task}
            onTaskClick={onTaskClick}
            draggableIcon={<SortableList.DragHandle />}
          />
        </SortableList.Item>
      )}
    />
  );
};

export const TaskList = (props: TaskListProps) => {
  const projects = useProjectsStore((state) => state.projects);
  const hasProjects = projects.length > 0;

  const groups = useMemo(
    () => (hasProjects ? groupItemsByProject(props.tasks, projects) : []),
    [hasProjects, props.tasks, projects]
  );

  if (!hasProjects) return <TaskSection {...props} sectionTasks={props.tasks} />;

  return (
    <VStack data-pw-id='task-groups' gap={5} width='100%' align='stretch'>
      {groups.map((group) => (
        <VStack key={group.project?.id ?? 'unassigned'} gap={3} align='stretch'>
          <ProjectGroupHeader project={group.project} />
          <TaskSection {...props} sectionTasks={group.items} />
        </VStack>
      ))}
    </VStack>
  );
};
