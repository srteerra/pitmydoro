import { hasProfanity } from '@/utils/profanity.utils';

export const DISPLAY_NAME_MAX_LENGTH = 30;

export const normalizeDisplayName = (value?: string | null): string =>
  (value || '').replace(/\s+/g, ' ').trim();

export const isDisplayNameTooLong = (value?: string | null): boolean =>
  normalizeDisplayName(value).length > DISPLAY_NAME_MAX_LENGTH;

export const displayNameHasProfanity = (value?: string | null): boolean =>
  hasProfanity(normalizeDisplayName(value));
