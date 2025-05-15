import { create } from 'zustand';

interface BottomBannerState {
  isVisible: boolean;
  title: string;
  image: string;
  description: string;
  link: string;
  smallText: string;
  declineText: string;
  acceptText: string;
  hideBanner: () => void;
  onAccept: () => void;
  onDecline: () => void;
  showBanner: (params: {
    title: string;
    description: string;
    declineText: string;
    acceptText: string;
    smallText?: string;
    link?: string;
    image?: string;
    onAccept?: () => void;
    onDecline?: () => void;
  }) => void;
}

export const useBottomBannerStore = create<BottomBannerState>((set) => ({
  isVisible: false,
  title: '',
  description: '',
  declineText: '',
  acceptText: '',
  image: '',
  link: '',
  smallText: '',
  onAccept: () => {},
  onDecline: () => {},
  showBanner: ({
    title,
    description,
    declineText,
    acceptText,
    image,
    onDecline,
    onAccept,
    smallText,
    link,
  }) =>
    set({
      isVisible: true,
      title,
      description,
      declineText,
      acceptText,
      image,
      onAccept,
      onDecline,
      smallText,
      link,
    }),
  hideBanner: () => set({ isVisible: false }),
}));
