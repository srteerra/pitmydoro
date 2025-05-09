import { HStack, Separator, Text } from '@chakra-ui/react';
import React from 'react';
import { usePomodoro } from '@/hooks/usePomodoro';
import usePomodoroStore from '@/stores/Pomodoro.store';
import { ITask } from '@/interfaces/Task.interface';
import { ZoneButton } from '../components/ZoneButton';
import { LuCirclePlus } from 'react-icons/lu';
import { SortableList } from '@/components/SortableList';
import { TaskCard } from '@/components/Pomodoro/Tasks/TaskCard';
import { useTranslations } from "use-intl";

export const Tasks = () => {
  const {
    handleAddTask,
    editingTask,
    setEditingTask,
    handleEditTask,
    handleDeleteTask,
    handleCheckTask,
    handleReorderTasks
  } = usePomodoro();
  const tasks = usePomodoroStore((state) => state.tasks);
  const currentTask = usePomodoroStore((state) => state.currentTask);
  const setCurrentTask = usePomodoroStore((state) => state.setCurrentTask);
  const t = useTranslations('pomodoro.tasks');

  const handleTaskClick = (task: ITask) => {
    if (!editingTask) {
      setCurrentTask(task);
    } else {
      setEditingTask(null);
      setCurrentTask(task);
    }
  };

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
        items={tasks}
        onChange={handleReorderTasks}
        renderItem={(task) => (
          <SortableList.Item id={task.id}>
            <TaskCard
              task={task}
              onTaskCheck={handleCheckTask}
              onTaskEdit={setEditingTask}
              onTaskDelete={handleDeleteTask}
              onTaskSubmit={handleEditTask}
              onTaskClick={handleTaskClick}
              isActive={currentTask?.id === task.id}
              isEditing={editingTask === task.id}
              disabledEditing={!!editingTask}
              draggableIcon={<SortableList.DragHandle />}
            />
          </SortableList.Item>
        )}
      />

      <ZoneButton
        isDisabled={!!editingTask}
        onClick={() => handleAddTask()}
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
