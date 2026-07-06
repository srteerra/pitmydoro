import { Timestamp } from 'firebase/firestore';

export interface User {
  email: string;
  emailVerified: boolean;
  preferences: {
    theme: 'dark' | 'light' | 'auto';
    language: 'es' | 'en';
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastConnection?: Timestamp;
}
