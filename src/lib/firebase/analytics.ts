import {
  Analytics,
  getAnalytics,
  isSupported,
  setAnalyticsCollectionEnabled,
} from 'firebase/analytics';
import { app } from './config';
import { IS_EMULATOR_MODE } from '@/constants/Emulators';

let instance: Analytics | null = null;

export const isAnalyticsConfigured = () =>
  !IS_EMULATOR_MODE && !!process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

export const enableAnalytics = async (): Promise<Analytics | null> => {
  if (typeof window === 'undefined' || !isAnalyticsConfigured()) return null;
  if (!(await isSupported())) return null;

  if (!instance) instance = getAnalytics(app);

  setAnalyticsCollectionEnabled(instance, true);

  return instance;
};

export const disableAnalytics = () => {
  if (!instance) return;

  setAnalyticsCollectionEnabled(instance, false);
};
