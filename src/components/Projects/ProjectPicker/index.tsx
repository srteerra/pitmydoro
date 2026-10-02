'use client';

import { useMemo } from 'react';
import {
  Box,
  createListCollection,
  HStack,
  Portal,
  Select,
  SelectRootProps,
  Text,
} from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { StickyNoteColor } from '@/interfaces/StickyNote.interface';
import { useProjectsStore } from '@/stores/Projects.store';
import { useResolveProjectName } from '@/hooks/useProjects';
import { ProjectColorDot } from '@/components/Projects/ProjectColorDot';
import { sortPinnedFirst } from '@/utils/pin.utils';
import {
  PROJECT_PICKER_BORDER_COLOR,
  PROJECT_PICKER_DOT_SIZE,
  PROJECT_PICKER_HOVER_BORDER_COLOR,
  PROJECT_PICKER_NONE_VALUE,
} from '@/constants/Projects';

interface ProjectOption {
  value: string;
  label: string;
  color?: StickyNoteColor;
}

interface ProjectPickerProps extends Omit<
  SelectRootProps<ProjectOption>,
  'collection' | 'value' | 'onValueChange' | 'onChange' | 'children' | 'size'
> {
  value: string | null;
  onChange: (projectId: string | null) => void;
  testId?: string;
}

const ProjectOptionLabel = ({ option }: { option: ProjectOption }) => (
  <HStack gap={2} minWidth={0}>
    {option.color ? (
      <ProjectColorDot color={option.color} size={PROJECT_PICKER_DOT_SIZE} />
    ) : (
      <Box
        width={PROJECT_PICKER_DOT_SIZE}
        height={PROJECT_PICKER_DOT_SIZE}
        flexShrink={0}
        rounded='full'
        borderWidth='1px'
        borderStyle='dashed'
        borderColor='fg.subtle'
      />
    )}
    <Text as='span' truncate>
      {option.label}
    </Text>
  </HStack>
);

export const ProjectPicker = ({
  value,
  onChange,
  testId = 'project-picker',
  ...rest
}: ProjectPickerProps) => {
  const t = useTranslations('projects');
  const resolveName = useResolveProjectName();
  const storedProjects = useProjectsStore((state) => state.projects);

  const collection = useMemo(
    () =>
      createListCollection<ProjectOption>({
        items: [
          { value: PROJECT_PICKER_NONE_VALUE, label: t('none') },
          ...sortPinnedFirst(storedProjects).map((project) => ({
            value: project.id,
            label: resolveName(project),
            color: project.color,
          })),
        ],
      }),
    [storedProjects, resolveName, t]
  );

  const selectedOption =
    collection.items.find((option) => option.value === value) ?? collection.items[0];

  return (
    <Select.Root
      collection={collection}
      size='sm'
      value={[selectedOption.value]}
      positioning={{ sameWidth: true }}
      disabled={!storedProjects.length}
      onValueChange={({ value: [projectId] }) =>
        onChange(projectId && projectId !== PROJECT_PICKER_NONE_VALUE ? projectId : null)
      }
      {...rest}
    >
      <Select.HiddenSelect />
      <Select.Label srOnly>{t('assign')}</Select.Label>

      <Select.Control>
        <Select.Trigger
          data-pw-id={testId}
          rounded='xl'
          bg='transparent'
          borderColor={PROJECT_PICKER_BORDER_COLOR}
          cursor='pointer'
          _hover={{ borderColor: PROJECT_PICKER_HOVER_BORDER_COLOR }}
          _disabled={{
            cursor: 'not-allowed',
            _hover: { borderColor: PROJECT_PICKER_BORDER_COLOR },
          }}
        >
          <Select.ValueText>
            <ProjectOptionLabel option={selectedOption} />
          </Select.ValueText>
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>

      <Portal>
        <Select.Positioner>
          <Select.Content rounded='xl' borderWidth='1px' borderColor={PROJECT_PICKER_BORDER_COLOR}>
            {collection.items.map((option) => (
              <Select.Item key={option.value} item={option} rounded='lg' cursor='pointer'>
                <ProjectOptionLabel option={option} />
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  );
};
