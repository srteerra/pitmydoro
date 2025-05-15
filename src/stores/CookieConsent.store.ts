import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CookieConsentState {
  consent: 'accepted' | 'declined' | null;
  setConsent: (value: 'accepted' | 'declined') => void;
}

export const useCookieConsentStore = create(
  persist<CookieConsentState>(
    (set) => ({
      consent: null,
      setConsent: (value) => set({ consent: value }),
    }),
    {
      name: 'cookie-consent-pitmydoro',
    }
  )
);
