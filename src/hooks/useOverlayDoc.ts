'use client';

import { useEffect, useState } from 'react';
import { OverlayDoc } from '@/interfaces/Overlay.interface';
import { overlayService } from '@/services/overlay.service';

export const useOverlayDoc = (token: string | null): Partial<OverlayDoc> | null => {
  const [data, setData] = useState<Partial<OverlayDoc> | null>(null);

  useEffect(() => {
    if (!token) {
      setData(null);
      return;
    }
    const unsubscribe = overlayService.subscribe(token, setData);
    return () => unsubscribe();
  }, [token]);

  return data;
};
