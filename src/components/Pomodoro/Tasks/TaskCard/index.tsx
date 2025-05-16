import React, { useEffect, useRef } from 'react';
import { ITask } from '@/interfaces/Task.interface';
import { HiDotsVertical } from 'react-icons/hi';
import { MdModeEdit, MdOutlineRestoreFromTrash, MdOutlineCheck } from 'react-icons/md';
import { TiTimes } from 'react-icons/ti';
import { FaCheck } from 'react-icons/fa';
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from '@/components/ui/menu';
import { Box, Card, Input, Flex, IconButton, Text, NumberInput, Textarea } from '@chakra-ui/react';
import { useTranslations } from 'use-intl';
import { useAlert } from '@/hooks/useAlert';

interface Props {
  task: ITask;
  onTaskEdit: (taskId: string | null) => void;
  draggableIcon?: React.ReactNode;
  isEditing?: boolean;
  disabledEditing?: boolean;
  isActive?: boolean;
  onTaskCheck?: (taskId: string, check: boolean) => void;
  onTaskSubmit?: (
    taskId: string,
    data: {
      title: string;
      description: string;
      numberOfPomodoros: number;
      taskCompletedPomodoros: number;
    }
  ) => void;
  onTaskClick?: (task: ITask) => void;
  onTaskDelete?: (taskId: string) => void;
}

export const TaskCard = ({
  task,
  draggableIcon,
  onTaskClick,
  onTaskDelete,
  onTaskEdit,
  onTaskCheck,
  onTaskSubmit,
  disabledEditing = false,
  isEditing = false,
  isActive = false,
}: Props) => {
  const ref = useRef<HTMLInputElement | null>(null);
  const [taskTitle, setTaskTitle] = React.useState<string>(task.title);
  const [taskDescription, setTaskDescription] = React.useState<string>(task.description);
  const [taskCompletedPomodoros, setTaskCompletedPomodoros] = React.useState<number>(
    task.pomodoros.filter((p) => p.completedAt).length
  );
  const [taskPomodoros, setTaskPomodoros] = React.useState<number>(task.pomodoros.length);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { confirmAlert, toastSuccess } = useAlert();
  const t = useTranslations('pomodoro.tasks');

  const handleOnTaskSubmit = (save?: boolean) => {
    if (!save) {
      onTaskEdit(null);
      setTaskTitle(task.title);
      setTaskDescription(task.description);
      setTaskPomodoros(task.pomodoros.length);
      setTaskCompletedPomodoros(task.pomodoros.filter((p) => p.completedAt).length);

      if (!taskTitle) {
        onTaskDelete?.(task.id);
      }

      return;
    }

    onTaskSubmit?.(task.id, {
      title: taskTitle,
      description: taskDescription,
      numberOfPomodoros: taskPomodoros,
      taskCompletedPomodoros,
    });

    onTaskEdit(null);
    toastSuccess(t('successUpdateTask'));
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).blur();
    setMenuOpen((prev) => !prev);
  };

  const handleEditTask = (taskId: string) => {
    setMenuOpen(false);
    onTaskEdit(taskId);
  };

  const handleMenuClose = () => {
    setMenuOpen(false);
  };

  const handleCheckTask = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    setTimeout(() => {
      onTaskCheck?.(task.id, !task.completed);

      if (!task.completed) toastSuccess(t('successCheckTask'));
      else toastSuccess(t('successUncheckTask'));
    }, 10);
  };

  const handleOnTaskDelete = async () => {
    if (await confirmAlert('Delete?', 'Are you sure you want to delete this task?')) {
      onTaskDelete?.(task.id);
      toastSuccess(t('successDeleteTask'));
    }
  };

  useEffect(() => {
    if (isEditing && ref.current) {
      ref.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    return () => {
      setMenuOpen(false);
    };
  }, []);

  useEffect(() => {
    setTaskPomodoros(task.pomodoros.length);
    setTaskCompletedPomodoros(task.pomodoros.filter((p) => p.completedAt).length);
  }, [task.pomodoros]);

  return (
    <Card.Root
      transition={'ease-in 0.2s'}
      bgColor={{ base: 'white', _dark: { base: 'dark.200/60', md: 'dark.100/20' } }}
      borderLeft={task.completed || isEditing || isActive ? '6px solid' : ''}
      borderColor={task.completed ? 'gray.400' : isEditing || isActive ? 'primary.default' : ''}
      flexDirection='row'
      cursor={isEditing ? 'auto' : 'pointer'}
      overflow='hidden'
      width='100%'
      onClick={() => {
        if (!isEditing && !task.completed) {
          onTaskClick?.(task);
          setTaskTitle(task.title);
          setTaskDescription(task.description);
          setTaskPomodoros(task.pomodoros.length);
          setTaskCompletedPomodoros(task.pomodoros.filter((p) => p.completedAt).length);
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
          {isEditing ? (
            <Box flex={1} w={'full'}>
              <Input
                w={'full'}
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                fontSize={'xl'}
                fontWeight={'bold'}
                variant={'flushed'}
                ref={ref}
                placeholder={t('taskTitlePlaceholder')}
              />
              <Textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                variant='flushed'
                w={'full'}
                placeholder={t('taskDescriptionPlaceholder')}
              />
            </Box>
          ) : (
            <Box>
              <Flex gap={2} alignItems='center'>
                {draggableIcon}
                <Flex flexDir='column'>
                  <Text
                    textDecoration={task.completed ? 'line-through' : ''}
                    textTransform={'capitalize'}
                  >
                    <Text as={'span'} color={'gray.400'}>
                      #{task.order}
                    </Text>{' '}
                    {task.title}
                  </Text>
                  <Text
                    fontStyle={task.completed ? 'italic' : 'normal'}
                    textTransform={'capitalize'}
                    color={'gray.400'}
                    fontSize={14}
                    lineClamp='3'
                  >
                    {task.description}
                  </Text>
                </Flex>
              </Flex>
            </Box>
          )}

          {!isEditing && (
            <Flex alignItems='center' gap={2}>
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
                  <IconButton rounded={'full'} variant={'ghost'} onClick={handleMenuToggle}>
                    <HiDotsVertical />
                  </IconButton>
                </MenuTrigger>
                {menuOpen && (
                  <MenuContent>
                    <MenuItem
                      disabled={disabledEditing}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (disabledEditing) return;
                        handleEditTask(task.id);
                      }}
                      value='edit'
                      cursor='pointer'
                    >
                      <MdModeEdit />
                      {t('editTask')}
                    </MenuItem>
                    <MenuItem onClick={(e) => handleCheckTask(e)} value='complete' cursor='pointer'>
                      {task.completed ? <TiTimes /> : <MdOutlineCheck />}
                      {task.completed ? t('markAsUncompleted') : t('markAsCompleted')}
                    </MenuItem>
                    <MenuItem
                      value='delete'
                      color='fg.error'
                      cursor='pointer'
                      onClick={() => {
                        handleMenuClose();
                        handleOnTaskDelete();
                      }}
                      _hover={{ bg: 'bg.error', color: 'fg.error' }}
                    >
                      <MdOutlineRestoreFromTrash />
                      {t('deleteTask')}
                    </MenuItem>
                  </MenuContent>
                )}
              </MenuRoot>
            </Flex>
          )}
        </Card.Body>

        {isEditing && (
          <Card.Footer flexWrap={'wrap'} justifyContent='space-between'>
            <Flex gap={4} alignItems='center'>
              <Text fontSize={'sm'} fontWeight={'bold'}>
                {t('noPomodoros')}
              </Text>
              <NumberInput.Root
                width='80px'
                disabled={task.completed}
                defaultValue={String(taskCompletedPomodoros)}
                onValueChange={(e) => setTaskCompletedPomodoros(Number(e.value))}
                min={0}
                max={task.pomodoros.length}
              >
                <NumberInput.Control>
                  <NumberInput.IncrementTrigger />
                  <NumberInput.DecrementTrigger />
                </NumberInput.Control>
                <NumberInput.Input />
              </NumberInput.Root>
              /
              <NumberInput.Root
                disabled={task.completed}
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
                _hover={{ opacity: 0.7 }}
                rounded={'lg'}
                flex={{ base: '1', sm: '0' }}
                bgColor={'red.400'}
                color='white'
              >
                <TiTimes />
              </IconButton>
              <IconButton
                disabled={!taskTitle}
                onClick={() => handleOnTaskSubmit(true)}
                transition={'all 0.3s'}
                _hover={{ opacity: 0.7 }}
                rounded={'lg'}
                flex={{ base: '1', sm: '0' }}
                bgColor={'green.400'}
                color='white'
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
