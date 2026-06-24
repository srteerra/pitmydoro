'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOverlayStore } from '@/stores/Overlay.store';
import useSessionStore from '@/stores/Session.store';
import useSettingsStore from '@/stores/Settings.store';
import { usePomodoroStore } from '@/stores/Pomodoro.store';
import { useTaskStore } from '@/stores/Tasks.store';
import { overlayService } from '@/services/overlay.service';
import { OverlayTimerState } from '@/interfaces/Overlay.interface';

const PUBLISH_DEBOUNCE_MS = 250;

export const useOverlayPublisher = () => {
  const { user } = useAuth();
  const token = useOverlayStore((state) => state.token);
  const enabled = useOverlayStore((state) => state.enabled);

  const status = useSessionStore((state) => state.status);
  const dateClock = useSessionStore((state) => state.dateClock);
  const flag = useSessionStore((state) => state.flag);
  const isActive = usePomodoroStore((state) => state.isActive);
  const overlayEndsAt = usePomodoroStore((state) => state.overlayEndsAt);
  const overlayRemainingMs = usePomodoroStore((state) => state.overlayRemainingMs);
  const currentScuderia = useSettingsStore((state) => state.currentScuderia);
  const mode = useSettingsStore((state) => state.mode);
  const taskTitle = useTaskStore((state) => state.currentTask?.title ?? null);

  const flagRef = useRef(flag);
  flagRef.current = flag;

  const lastKeyRef = useRef<string>('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user || !token || !enabled) return;

    const endsAt = isActive ? (overlayEndsAt ?? dateClock) : null;
    const remainingMs = isActive
      ? Math.max((overlayEndsAt ?? dateClock) - Date.now(), 0)
      : (overlayRemainingMs ?? Math.max(dateClock - Date.now(), 0));

    const payload: OverlayTimerState = {
      isActive,
      status,
      endsAt,
      remainingMs,
      scuderia: currentScuderia
        ? { id: currentScuderia.id, sprite: currentScuderia.spriteURL }
        : null,
      taskTitle,
      flag: flagRef.current ?? null,
      mode,
    };

    const key = JSON.stringify({ ...payload, remainingMs: isActive ? 0 : remainingMs });
    if (key === lastKeyRef.current) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      lastKeyRef.current = key;
      void overlayService.publishTimer(token, payload);
    }, PUBLISH_DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [
    user,
    token,
    enabled,
    isActive,
    status,
    overlayEndsAt,
    overlayRemainingMs,
    dateClock,
    currentScuderia,
    mode,
    taskTitle,
  ]);
};
