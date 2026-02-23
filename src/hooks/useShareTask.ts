import html2canvas from 'html2canvas';
import { useRef } from 'react';
import useUserStore from '@/stores/User.store';

export const useShareTask = () => {
  const { profile } = useUserStore();
  const cardRef = useRef<HTMLDivElement>(null);

  const generateImage = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;

    const canvas = await html2canvas(cardRef.current, { scale: 2 });

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  };

  const downloadImage = async () => {
    const blob = await generateImage();
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'task-summary.png';
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareImage = async () => {
    const blob = await generateImage();
    if (!blob || !profile?.uid) return;

    const file = new File([blob], 'task-summary.png', { type: 'image/png' });

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title: 'Task completed!',
        files: [file],
      });
    }
  };

  return { cardRef, shareImage, downloadImage };
};
