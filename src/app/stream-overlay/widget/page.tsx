'use client';

import React, { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box } from '@chakra-ui/react';
import { OverlayWidget } from '@/components/StreamOverlay/OverlayWidget';
import { useOverlayDoc } from '@/hooks/useOverlayDoc';
import { DEFAULT_OVERLAY_CONFIG } from '@/utils/overlay/overlayConfig';
import { OverlayTimerState } from '@/interfaces/Overlay.interface';
import { SessionStatusEnum } from '@/enums/SessionStatus.enum';
import { PomodoroMode } from '@/interfaces/Settings.interface';

const WidgetContent = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const doc = useOverlayDoc(token);

  const config = { ...DEFAULT_OVERLAY_CONFIG, ...(doc?.config ?? {}) };
  const state: OverlayTimerState | null = doc
    ? {
        isActive: !!doc.isActive,
        status: doc.status ?? SessionStatusEnum.IN_SESSION,
        endsAt: doc.endsAt ?? null,
        remainingMs: doc.remainingMs ?? 0,
        scuderia: doc.scuderia ?? null,
        taskTitle: doc.taskTitle ?? null,
        flag: doc.flag ?? null,
        mode: doc.mode ?? PomodoroMode.F1,
      }
    : null;

  useEffect(() => {
    const html = document.documentElement;
    const { body } = document;
    const previous = {
      htmlBg: html.style.background,
      bodyBg: body.style.background,
      overflow: body.style.overflow,
    };

    html.style.background = 'transparent';
    body.style.background = 'transparent';
    body.style.overflow = 'hidden';

    return () => {
      html.style.background = previous.htmlBg;
      body.style.background = previous.bodyBg;
      body.style.overflow = previous.overflow;
    };
  }, []);

  return (
    <Box position='fixed' inset={0} width='100vw' height='100vh' background='transparent'>
      <OverlayWidget config={config} state={state} />
    </Box>
  );
};

export default function StreamOverlayWidget() {
  return (
    <Suspense fallback={null}>
      <WidgetContent />
    </Suspense>
  );
}
