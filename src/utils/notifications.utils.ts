import { DEFAULT_NOTIFICATION_LOCALE, UNREAD_BADGE_LIMIT } from '@/constants/Social';
import { LocalizedText } from '@/interfaces/Notification.interface';

export const resolveLocalizedText = (
  text: LocalizedText | null | undefined,
  locale: string
): string => {
  if (!text) return '';
  if (typeof text === 'string') return text;
  return text[locale] ?? text[DEFAULT_NOTIFICATION_LOCALE] ?? Object.values(text)[0] ?? '';
};

export const formatUnreadCount = (count: number): string =>
  count > UNREAD_BADGE_LIMIT ? `${UNREAD_BADGE_LIMIT}+` : `${count}`;

export const isInternalLink = (link: string): boolean => link.startsWith('/');
