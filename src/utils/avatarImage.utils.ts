export const AVATAR_MAX_INPUT_BYTES = 8 * 1024 * 1024;

export const AVATAR_ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;

export const AVATAR_ACCEPT_ATTRIBUTE = AVATAR_ACCEPTED_TYPES.join(',');

export type AvatarRejection = 'type' | 'size';

export const isAcceptedAvatarType = (file: File) =>
  (AVATAR_ACCEPTED_TYPES as readonly string[]).includes(file.type);

export const validateAvatarFile = (file: File): AvatarRejection | null => {
  if (!isAcceptedAvatarType(file)) return 'type';
  if (file.size > AVATAR_MAX_INPUT_BYTES) return 'size';
  return null;
};

export const AVATAR_EXTENSIONS = ['png', 'jpg', 'webp'] as const;

export const avatarExtension = (contentType: string) => {
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/webp') return 'webp';
  return 'jpg';
};
