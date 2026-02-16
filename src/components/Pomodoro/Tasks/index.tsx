import { HStack, Separator, Text } from '@chakra-ui/react';
import React, { useMemo } from 'react';
import { Task } from '@/interfaces/Task.interface';
import { ZoneButton } from '../components/ZoneButton';
import { LuCirclePlus } from 'react-icons/lu';
import { SortableList } from '@/components/SortableList';
import { TaskCard } from '@/components/Pomodoro/Tasks/TaskCard';
import { useTranslations } from 'use-intl';
import { useTasks } from '@/hooks/useTasks';
import { useTaskStore } from '@/stores/Tasks.store';
import _ from 'lodash';
import { usePomodoro } from '@/hooks/usePomodoro';

export const Tasks = () => {
  const { loading, handleAddTask, handleReorderTasks } = useTasks();
  const { switchTask } = usePomodoro();
  const tasks = useTaskStore((state) => state.tasks);
  const editingTask = useTaskStore((state) => state.editingTask);
  const setEditingTask = useTaskStore((state) => state.setEditingTask);
  const t = useTranslations('pomodoro.tasks');

  const sortedTasks = useMemo(() => {
    return _.sortBy(tasks, 'order');
  }, [tasks]);

  const handleTaskClick = async (task: Task) => {
    if (!editingTask) {
      await switchTask(task);
    } else {
      if (tasks?.length && tasks.some((t) => !t.title)) return;
      setEditingTask(null);
      await switchTask(task);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <React.Fragment>
      <HStack margin={'40px 0 20px'} display='flex' justifyContent='center'>
        <Separator flex='1' />
        <Text flexShrink='0' fontSize={'sm'}>
          {t('title')}
        </Text>
        <Separator flex='1' />
      </HStack>

      <SortableList
        items={sortedTasks}
        onChange={handleReorderTasks}
        renderItem={(task) => (
          <SortableList.Item id={task.id}>
            <TaskCard
              task={task}
              onTaskClick={handleTaskClick}
              draggableIcon={<SortableList.DragHandle />}
            />
          </SortableList.Item>
        )}
      />

      <ZoneButton
        isDisabled={!!editingTask}
        onClick={() => {
          handleAddTask();
        }}
        fontWeight={'semibold'}
        size={'sm'}
        mt={6}
      >
        <LuCirclePlus size={25} />
        {t('addTask')}
      </ZoneButton>
    </React.Fragment>
  );
};
