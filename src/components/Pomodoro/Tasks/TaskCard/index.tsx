import React, { useEffect, useRef } from 'react';
import { Task } from '@/interfaces/Task.interface';
import { HiDotsVertical } from 'react-icons/hi';
import { MdModeEdit, MdOutlineCheck, MdOutlineRestoreFromTrash } from 'react-icons/md';
import { IoIosStats } from 'react-icons/io';
import { TiTimes } from 'react-icons/ti';
import { FaCheck } from 'react-icons/fa';
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from '@/components/ui/menu';
import { Box, Card, Flex, IconButton, Input, NumberInput, Text, Textarea } from '@chakra-ui/react';
import { useTranslations } from 'use-intl';
import { useAlert } from '@/hooks/useAlert';
import { useTaskStore } from '@/stores/Tasks.store';
import { useTasks } from '@/hooks/useTasks';
import { useDrawer } from '@/contexts/DrawerContext';
import { StatsDialog } from '@/components/Tasks/StatsDialog';
import { BiStats } from 'react-icons/bi';
import { useTheme } from 'next-themes';

interface Props {
  task: Task;
  draggableIcon?: React.ReactNode;
  onTaskClick?: (task: Task) => void;
}

export const TaskCard = ({ task, onTaskClick, draggableIcon }: Props) => {
  const { deleteTask, checkTask, handleEditTask } = useTasks();
  const { openDrawer } = useDrawer();
  const ref = useRef<HTMLInputElement | null>(null);
  const [taskTitle, setTaskTitle] = React.useState<string>(task.title);
  const [taskDescription, setTaskDescription] = React.useState<string>(task.description);
  const { theme } = useTheme();
  const { confirmAlert, toastSuccess, toastWarning } = useAlert();
  const statsT = useTranslations('stats');
  const t = useTranslations('pomodoro.tasks');
  const [taskPomodoros, setTaskPomodoros] = React.useState<number>(task.estimatedPomodoros);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [taskCompletedPomodoros, setTaskCompletedPomodoros] = React.useState<number>(
    task.totalPomodoros || 0
  );
  const editingTask = useTaskStore((state) => state.editingTask);
  const setEditingTask = useTaskStore((state) => state.setEditingTask);
  const currentTask = useTaskStore((state) => state.currentTask);

  const isCurrentEditing = React.useMemo(() => {
    return editingTask === task.id;
  }, [editingTask, task.id]);

  const handleOpenStats = (e: React.MouseEvent) => {
    e.stopPropagation();

    setMenuOpen(false);
    openDrawer({
      topTitle: {
        label: statsT('title'),
        icon: <BiStats />,
      },
      component: <StatsDialog task={task} />,
      offset: 4,
    });
  };

  const handleOnTaskSubmit = async (save?: boolean) => {
    if (!save) {
      setEditingTask(null);
      setTaskTitle(task.title);
      setTaskDescription(task.description);
      setTaskPomodoros(task.estimatedPomodoros);
      setTaskCompletedPomodoros(task.totalPomodoros || 0);

      if (!taskTitle) {
        await deleteTask(task.id);
      }

      return;
    }

    await handleEditTask(task.id, {
      title: taskTitle,
      description: taskDescription,
      numberOfPomodoros: taskPomodoros,
      taskCompletedPomodoros,
    });

    setEditingTask(null);
    toastSuccess(t('successUpdateTask'));
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).blur();
    setMenuOpen((prev) => !prev);
  };

  const editTask = (taskId: string) => {
    setMenuOpen(false);
    setEditingTask(taskId);
  };

  const handleMenuClose = () => {
    setMenuOpen(false);
  };

  const handleCheckTask = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);

    setTimeout(() => {
      checkTask(task.id, !task.completedAt);
      if (!task.completedAt) toastSuccess(t('successCheckTask'));
      else toastSuccess(t('successUncheckTask'));
    }, 100);
  };

  const handleOnTaskDelete = async () => {
    if (await confirmAlert(t('deleteTaskConfirmTitle'), { type: 'danger' })) {
      await deleteTask(task.id);
      toastSuccess(t('successDeleteTask'));
    }
  };

  useEffect(() => {
    if (isCurrentEditing && ref.current) {
      ref.current.focus();
    }
  }, [isCurrentEditing]);

  useEffect(() => {
    return () => {
      setMenuOpen(false);
    };
  }, []);

  useEffect(() => {
    setTaskPomodoros(task.estimatedPomodoros);
    setTaskCompletedPomodoros(task.totalPomodoros || 0);
  }, [task.estimatedPomodoros, task.totalPomodoros]);

  return (
    <Card.Root
      data-pw-id='task-card'
      data-task-id={task.id}
      transition={'ease-in 0.2s'}
      bgColor={{
        base: 'white',
        _dark: {
          base: 'dark.200/60',
          md: task?.id === currentTask?.id ? 'primary.default/5' : 'dark.100/20',
        },
      }}
      borderLeft={
        !!task.completedAt || isCurrentEditing || task?.id === currentTask?.id ? '6px solid' : ''
      }
      borderColor={
        !!task.completedAt
          ? theme === 'dark'
            ? 'gray.700'
            : 'gray.300'
          : task?.id === currentTask?.id
            ? theme === 'dark'
              ? 'primary.default/70'
              : 'primary.default'
            : ''
      }
      flexDirection='row'
      cursor={isCurrentEditing ? 'auto' : task.completedAt ? 'default' : 'pointer'}
      overflow='hidden'
      width='100%'
      onClick={() => {
        if (!isCurrentEditing && !task.completedAt) {
          onTaskClick?.(task);
          setTaskTitle(task.title);
          setTaskDescription(task.description);
          setTaskPomodoros(task.estimatedPomodoros);
          setTaskCompletedPomodoros(task.totalPomodoros);
        }
      }}
    >
      <Box width='100%'>
        <Card.Body
          p={'15px 10px'}
          display={'flex'}
          flexDirection={'row'}
          justifyContent={'space-between'}
          gap={4}
          alignItems='center'
        >
          {isCurrentEditing ? (
            <Box flex={1} w={'full'}>
              <Input
                w={'full'}
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                fontSize={'xl'}
                fontWeight={'bold'}
                variant={'flushed'}
                ref={ref}
                maxLength={80}
                placeholder={t('taskTitlePlaceholder')}
                data-pw-id='task-title-input'
              />
              <Textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                variant='flushed'
                w={'full'}
                maxLength={250}
                placeholder={t('taskDescriptionPlaceholder')}
                data-pw-id='task-description-input'
              />
            </Box>
          ) : (
            <Box flex={1} minW={0}>
              <Flex gap={2} alignItems='center' minW={0}>
                {draggableIcon}
                <Flex flexDir='column' minW={0}>
                  <Text
                    textDecoration={task.completedAt ? 'line-through' : ''}
                    textTransform={'capitalize'}
                    overflowWrap={'anywhere'}
                    lineClamp='2'
                  >
                    <Text as={'span'} color={'gray.400'}>
                      #{task.order}
                    </Text>{' '}
                    {task.title}
                  </Text>
                  <Text
                    fontStyle={task.completedAt ? 'italic' : 'normal'}
                    textTransform={'capitalize'}
                    color={'gray.400'}
                    fontSize={14}
                    overflowWrap={'anywhere'}
                    lineClamp='3'
                  >
                    {task.description}
                  </Text>
                </Flex>
              </Flex>
            </Box>
          )}

          {!isCurrentEditing && (
            <Flex alignItems='center' gap={2} flexShrink={0}>
              <Text minW={'40px'}>
                {taskCompletedPomodoros} / {taskPomodoros}
              </Text>

              <MenuRoot
                open={menuOpen}
                unmountOnExit={true}
                closeOnSelect={true}
                onOpenChange={(open) => {
                  if (!open) {
                    handleMenuClose();
                  }
                }}
                onInteractOutside={handleMenuClose}
                positioning={{ placement: 'right-start', hideWhenDetached: true }}
              >
                <MenuTrigger asChild>
                  <IconButton
                    rounded={'full'}
                    variant={'ghost'}
                    onClick={handleMenuToggle}
                    data-pw-id='task-menu-trigger'
                  >
                    <HiDotsVertical />
                  </IconButton>
                </MenuTrigger>
                {menuOpen && (
                  <MenuContent>
                    <MenuItem
                      onClick={handleOpenStats}
                      value='stats'
                      cursor='pointer'
                      data-pw-id='task-menu-stats'
                    >
                      <IoIosStats />
                      {statsT('seeStats')}
                    </MenuItem>

                    <MenuItem
                      disabled={!!editingTask}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (editingTask) return;
                        editTask(task.id);
                      }}
                      value='edit'
                      cursor='pointer'
                      data-pw-id='task-menu-edit'
                    >
                      <MdModeEdit />
                      {t('editTask')}
                    </MenuItem>

                    <MenuItem
                      onClick={(e) => handleCheckTask(e)}
                      value='complete'
                      cursor='pointer'
                      data-pw-id='task-menu-complete'
                    >
                      {task.completedAt ? <TiTimes /> : <MdOutlineCheck />}
                      {task.completedAt ? t('markAsUncompleted') : t('markAsCompleted')}
                    </MenuItem>

                    <MenuItem
                      value='delete'
                      color='danger.fg'
                      cursor='pointer'
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuClose();
                        handleOnTaskDelete();
                      }}
                      _hover={{ bg: 'danger.subtle', color: 'danger.fg' }}
                      data-pw-id='task-menu-delete'
                    >
                      <MdOutlineRestoreFromTrash />
                      {t('archiveTask')}
                    </MenuItem>
                  </MenuContent>
                )}
              </MenuRoot>
            </Flex>
          )}
        </Card.Body>

        {isCurrentEditing && (
          <Card.Footer flexWrap={'wrap'} justifyContent='space-between'>
            <Flex gap={4} alignItems='center'>
              <Text fontSize={'sm'} fontWeight={'bold'}>
                {t('noPomodoros')}
              </Text>
              <NumberInput.Root
                width='80px'
                disabled={!!task.completedAt}
                defaultValue={String(taskCompletedPomodoros)}
                onValueChange={(e) => {
                  const value = Number(e.value);
                  const recorded = task.totalPomodoros || 0;
                  if (value !== recorded && taskCompletedPomodoros === recorded) {
                    toastWarning(t('manualPomodorosWarning'));
                  }
                  setTaskCompletedPomodoros(value);
                }}
                min={0}
                max={task.estimatedPomodoros}
              >
                <NumberInput.Control>
                  <NumberInput.IncrementTrigger />
                  <NumberInput.DecrementTrigger />
                </NumberInput.Control>
                <NumberInput.Input />
              </NumberInput.Root>
              /
              <NumberInput.Root
                disabled={!!task.completedAt}
                defaultValue={String(taskPomodoros)}
                onValueChange={(e) => setTaskPomodoros(Number(e.value))}
                spinOnPress={false}
                width='80px'
                min={1}
              >
                <NumberInput.Control>
                  <NumberInput.IncrementTrigger />
                  <NumberInput.DecrementTrigger />
                </NumberInput.Control>
                <NumberInput.Input />
              </NumberInput.Root>
            </Flex>

            <Flex gap={2} flex={{ base: '1', sm: '0' }}>
              <IconButton
                onClick={() => handleOnTaskSubmit(false)}
                transition={'all 0.3s'}
                rounded={'lg'}
                flex={{ base: '1', sm: '0' }}
                bgColor='danger.subtle'
                color='danger.fg'
                _hover={{ bgColor: 'danger.muted' }}
                data-pw-id='task-cancel-button'
              >
                <TiTimes />
              </IconButton>
              <IconButton
                disabled={!taskTitle}
                onClick={() => handleOnTaskSubmit(true)}
                transition={'all 0.3s'}
                rounded={'lg'}
                flex={{ base: '1', sm: '0' }}
                bgColor='success.subtle'
                color='success.fg'
                _hover={{ bgColor: 'success.muted' }}
                data-pw-id='task-save-button'
              >
                <FaCheck />
              </IconButton>
            </Flex>
          </Card.Footer>
        )}
      </Box>
    </Card.Root>
  );
};
