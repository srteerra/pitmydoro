import { Timestamp } from 'firebase/firestore';

export interface Follow {
  uid: string;
  favorite: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
