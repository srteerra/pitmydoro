'use client';

import { useState } from 'react';
import { Button, HStack, IconButton, Input, Textarea, VStack } from '@chakra-ui/react';
import { LuSave, LuTrash2 } from 'react-icons/lu';
import { BsArrowReturnLeft } from 'react-icons/bs';
import { useTranslations } from 'next-intl';
import { Project } from '@/interfaces/Project.interface';
import { StickyNoteColor } from '@/interfaces/StickyNote.interface';
import { PROJECT_PALETTE } from '@/constants/Projects';
import { useProjects } from '@/hooks/useProjects';
import { useAlert } from '@/hooks/useAlert';
import { ColorSwatches } from '@/components/StickyNotes/ColorSwatches';
import { Tooltip } from '@/components/ui/tooltip';

interface ProjectEditorProps {
  project: Project;
  isNew?: boolean;
  onDone?: () => void;
  onBack?: () => void;
}

export const ProjectEditor = ({ project, isNew = false, onDone, onBack }: ProjectEditorProps) => {
  const t = useTranslations('projects');
  const { addProject, updateProject, removeProject } = useProjects();
  const { confirmAlert, toastSuccess } = useAlert();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? '');
  const [color, setColor] = useState<StickyNoteColor>(project.color);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);

    const draft = { name: name.trim(), description: description.trim(), color };

    if (isNew) await addProject(draft);
    else await updateProject(project.id, draft);

    setSaving(false);
    toastSuccess(t('saved'));
    onDone?.();
  };

  const handleDelete = async () => {
    if (!(await confirmAlert(t('deleteConfirm'), { type: 'danger' }))) return;

    await removeProject(project.id);
    onDone?.();
  };

  return (
    <VStack align='stretch' gap={4} data-pw-id='project-editor'>
      {onBack && (
        <Button
          data-pw-id='project-editor-back'
          variant='plain'
          size='sm'
          alignSelf='flex-start'
          height='auto'
          paddingX={0}
          textDecoration='underline'
          opacity={0.7}
          _hover={{ opacity: 1 }}
          onClick={onBack}
        >
          <BsArrowReturnLeft /> {t('backToList')}
        </Button>
      )}

      <Input
        data-pw-id='project-name-input'
        data-autofocus={isNew || undefined}
        variant='flushed'
        fontWeight='semibold'
        maxLength={40}
        value={name}
        placeholder={t('namePlaceholder')}
        onChange={(event) => setName(event.target.value)}
      />

      <Textarea
        data-pw-id='project-description-input'
        variant='flushed'
        fontSize='sm'
        rows={3}
        maxLength={250}
        resize='none'
        value={description}
        placeholder={t('descriptionPlaceholder')}
        onChange={(event) => setDescription(event.target.value)}
      />

      <ColorSwatches
        value={color}
        palette={PROJECT_PALETTE[color]}
        palettes={PROJECT_PALETTE}
        getAriaLabel={(option) => t('colorOption', { color: option })}
        onChange={setColor}
      />

      <HStack justifyContent='flex-end' gap={2} paddingTop={2}>
        {!isNew && (
          <Tooltip content={t('delete')} openDelay={100} closeDelay={100}>
            <IconButton
              data-pw-id='project-delete'
              aria-label={t('delete')}
              size='sm'
              rounded='xl'
              bg='danger.subtle'
              color='danger.fg'
              _hover={{ bg: 'danger.muted' }}
              onClick={handleDelete}
            >
              <LuTrash2 />
            </IconButton>
          </Tooltip>
        )}

        <Button
          data-pw-id='project-save'
          size='sm'
          rounded='xl'
          loading={saving}
          onClick={handleSave}
        >
          <LuSave /> {t('save')}
        </Button>
      </HStack>
    </VStack>
  );
};
