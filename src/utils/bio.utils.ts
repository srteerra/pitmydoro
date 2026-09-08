import { hasProfanity } from '@/utils/profanity.utils';

export const BIO_MAX_LENGTH = 250;

const LINK_PATTERN =
  /(https?:\/\/|www\.)|([a-z0-9-]+\.(com|net|org|io|gg|tv|co|xyz|me|dev|app|link|es|info|biz))\b/i;

export const bioHasLink = (value: string): boolean => LINK_PATTERN.test(value);

export const bioHasProfanity = (value: string): boolean => hasProfanity(value);
