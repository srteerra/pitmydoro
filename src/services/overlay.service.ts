import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { OverlayConfig, OverlayDoc, OverlayTimerState } from '@/interfaces/Overlay.interface';
import { DEFAULT_OVERLAY_CONFIG } from '@/utils/overlay/overlayConfig';

const overlayRef = (token: string) => doc(db, 'overlays', token);

export const overlayService = {
  async initDoc(token: string) {
    if (!token) return;
    await setDoc(
      overlayRef(token),
      {
        config: DEFAULT_OVERLAY_CONFIG,
        isActive: false,
        status: 'session',
        endsAt: null,
        remainingMs: 0,
        scuderia: null,
        taskTitle: null,
        flag: null,
        mode: 'f1',
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  },

  async publishTimer(token: string, timer: OverlayTimerState) {
    if (!token) return;
    await setDoc(overlayRef(token), { ...timer, updatedAt: serverTimestamp() }, { merge: true });
  },

  async publishConfig(token: string, config: OverlayConfig) {
    if (!token) return;
    await setDoc(overlayRef(token), { config, updatedAt: serverTimestamp() }, { merge: true });
  },

  subscribe(token: string, callback: (data: Partial<OverlayDoc> | null) => void) {
    if (!token) return () => undefined;
    return onSnapshot(
      overlayRef(token),
      (snapshot) => callback(snapshot.exists() ? (snapshot.data() as Partial<OverlayDoc>) : null),
      () => callback(null)
    );
  },
};
