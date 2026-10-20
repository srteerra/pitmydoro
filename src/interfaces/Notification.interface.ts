import { Timestamp } from 'firebase/firestore';
import { NotificationTypeEnum } from '@/enums/NotificationType.enum';

export type LocalizedText = string | Record<string, string>;

export interface NotificationActor {
  uid: string;
  username: string;
  displayName: string;
  photoURL: string | null;
}

export interface AppNotification {
  id: string;
  type: NotificationTypeEnum;
  actor?: NotificationActor | null;
  title?: LocalizedText | null;
  body?: LocalizedText | null;
  link?: string | null;
  read: boolean;
  createdAt: Timestamp;
}
