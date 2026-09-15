'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export const ScrollToTop = () => {
  const pathname = usePathname();

  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.slice(1));

    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      return;
    }

    let frame = 0;
    const deadline = Date.now() + 2000;

    const scrollToHash = () => {
      const target = document.getElementById(hash);

      if (target) {
        target.scrollIntoView();
        return;
      }

      if (Date.now() < deadline) frame = requestAnimationFrame(scrollToHash);
    };

    scrollToHash();

    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
};
