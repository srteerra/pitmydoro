import { keyframes } from '@emotion/react';

export const TAB_SLIDE_IN = keyframes`
  from {
    transform: translateX(0);
  }
`;

export const TAB_SLIDE_IN_ANIMATION = `${TAB_SLIDE_IN} 0.55s cubic-bezier(0.22, 1.16, 0.4, 1) backwards`;
export const TAB_SLIDE_IN_STAGGER_MS = 60;

export const CAR_ENTRY = keyframes`
  0% {
    transform: scale(0.92);
  }
  60% {
    transform: scale(1.03);
  }
  100% {
    transform: scale(1);
  }
`;

export const CAR_ENTRY_ANIMATION = `${CAR_ENTRY} 0.6s cubic-bezier(0.22, 1, 0.36, 1) both`;
