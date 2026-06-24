import { create } from 'zustand';
import { userService } from '@/services/user.service';
import { overlayService } from '@/services/overlay.service';
import { DEFAULT_OVERLAY_CONFIG } from '@/utils/overlay/overlayConfig';
import { OverlayConfig, OverlaySettings } from '@/interfaces/Overlay.interface';

const createToken = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
};

interface OverlayStore {
  token: string;
  enabled: boolean;
  loaded: boolean;
  applySettings: (settings?: OverlaySettings | null) => void;
  ensure: (userId: string, config?: OverlayConfig) => Promise<string>;
  setEnabled: (userId: string, enabled: boolean) => Promise<void>;
  clear: () => void;
}

export const useOverlayStore = create<OverlayStore>((set, get) => ({
  token: '',
  enabled: false,
  loaded: false,

  applySettings: (settings) =>
    set({ token: settings?.token ?? '', enabled: settings?.enabled ?? false, loaded: true }),

  ensure: async (userId, config = DEFAULT_OVERLAY_CONFIG) => {
    const existing = get().token;
    if (existing) return existing;

    const token = createToken();
    await userService.updateOverlaySettings(userId, { token, enabled: get().enabled });
    await overlayService.publishConfig(token, config);
    set({ token });
    return token;
  },

  setEnabled: async (userId, enabled) => {
    set({ enabled });
    await userService.updateOverlaySettings(userId, { enabled });
  },

  clear: () => set({ token: '', enabled: false, loaded: false }),
}));
