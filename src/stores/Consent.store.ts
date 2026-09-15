import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

export type ConsentStatus = 'pending' | 'accepted' | 'declined';

interface ConsentState {
  status: ConsentStatus;
  decidedAt: number | null;
  version: number;
}

interface ConsentActions {
  accept: () => void;
  decline: () => void;
  reset: () => void;
}

export const CONSENT_VERSION = 1;

const useConsentStore = create<ConsentState & ConsentActions>()(
  devtools(
    persist(
      (set) => ({
        status: 'pending',
        decidedAt: null,
        version: CONSENT_VERSION,
        accept: () =>
          set(() => ({ status: 'accepted', decidedAt: Date.now(), version: CONSENT_VERSION })),
        decline: () =>
          set(() => ({ status: 'declined', decidedAt: Date.now(), version: CONSENT_VERSION })),
        reset: () => set(() => ({ status: 'pending', decidedAt: null, version: CONSENT_VERSION })),
      }),
      {
        name: 'pitmydoro_consent',
        storage: typeof window !== 'undefined' ? createJSONStorage(() => localStorage) : undefined,
      }
    )
  )
);

export const hasCookieConsent = () => useConsentStore.getState().status === 'accepted';

export default useConsentStore;
