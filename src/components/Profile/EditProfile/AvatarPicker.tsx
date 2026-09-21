'use client';

import React, { useRef, useState } from 'react';
import { Button, HStack, VStack } from '@chakra-ui/react';
import { LuTrash2, LuUpload } from 'react-icons/lu';
import { useTranslations } from 'next-intl';
import { PixelAvatar } from '@/components/Profile/PixelAvatar';
import { avatarService } from '@/services/avatar.service';
import { useAlert } from '@/hooks/useAlert';
import {
  AVATAR_ACCEPT_ATTRIBUTE,
  AVATAR_MAX_INPUT_BYTES,
  validateAvatarFile,
} from '@/utils/avatarImage.utils';

interface Props {
  userId?: string;
  name?: string;
  color?: string;
  photoURL?: string | null;
  onChange: (photo: { photoURL: string | null }) => void;
}

export const AvatarPicker = ({ userId, name, color, photoURL, onChange }: Props) => {
  const t = useTranslations('profile');
  const { toastSuccess, toastError, confirmAlert } = useAlert();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);

  const handlePick = () => inputRef.current?.click();

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file || !userId) return;

    const rejection = validateAvatarFile(file);
    if (rejection === 'type') return toastError(t('avatarInvalidType'));
    if (rejection === 'size')
      return toastError(
        t('avatarTooLarge', { max: Math.round(AVATAR_MAX_INPUT_BYTES / (1024 * 1024)) })
      );

    setBusy(true);
    try {
      const uploaded = await avatarService.upload(userId, file, photoURL);
      onChange(uploaded);
      toastSuccess(t('avatarUpdated'));
    } catch (error) {
      console.error('Avatar upload failed:', error, {
        name: file.name,
        type: file.type,
        size: file.size,
      });
      toastError(t('avatarUploadError'));
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    if (!userId || !photoURL) return;

    const confirmed = (await confirmAlert(t('avatarRemoveTitle'), {
      text: t('avatarRemoveText'),
      type: 'warning',
      confirmButtonText: t('avatarRemove'),
      denyButtonText: t('cancel'),
    })) as boolean;

    if (!confirmed) return;

    setBusy(true);
    try {
      await avatarService.remove(userId, photoURL);
      onChange({ photoURL: null });
      toastSuccess(t('avatarRemoved'));
    } catch (error) {
      console.error('Avatar removal failed:', error);
      toastError(t('avatarRemoveError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <VStack align='center' gap={3}>
      <PixelAvatar
        name={name}
        color={color}
        photoURL={photoURL}
        size={{ base: 112 }}
        ring={false}
      />

      <input
        ref={inputRef}
        type='file'
        accept={AVATAR_ACCEPT_ATTRIBUTE}
        onChange={handleFile}
        hidden
        data-pw-id='profile-avatar-input'
      />

      <HStack gap={2}>
        <Button
          type='button'
          data-pw-id='profile-avatar-upload'
          onClick={handlePick}
          loading={busy}
          disabled={!userId}
          variant='outline'
          rounded='full'
          size='xs'
          px={4}
        >
          <LuUpload />
          {photoURL ? t('avatarChange') : t('avatarUpload')}
        </Button>

        {photoURL && (
          <Button
            type='button'
            data-pw-id='profile-avatar-remove'
            onClick={handleRemove}
            loading={busy}
            variant='ghost'
            rounded='full'
            size='xs'
            colorPalette='red'
            aria-label={t('avatarRemove')}
          >
            <LuTrash2 />
          </Button>
        )}
      </HStack>
    </VStack>
  );
};
