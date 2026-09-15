'use client';

import { useEffect } from 'react';
import useConsentStore from '@/stores/Consent.store';
import { disableAnalytics, enableAnalytics } from '@/lib/firebase/analytics';

export const Analytics = () => {
  const status = useConsentStore((state) => state.status);

  useEffect(() => {
    if (status !== 'accepted') {
      disableAnalytics();
      return;
    }

    enableAnalytics().catch(() => undefined);
  }, [status]);

  return null;
};
