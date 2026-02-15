import Swal from 'sweetalert2';
import { useToken } from '@chakra-ui/react';
import './styles.css';
import tinycolor from 'tinycolor2';
import { useTheme } from 'next-themes';
import { toaster } from '@/components/ui/toaster';
import { useTranslations } from 'use-intl';

interface ToastOptions {
  title: string;
  description?: string;
  duration?: number;
  closable?: boolean;
  type?: 'success' | 'error' | 'info' | 'warning';
}

export const useAlert = () => {
  const { theme } = useTheme();
  const [primaryColor] = useToken('colors', ['primary.default']);
  const [dangerColor] = useToken('colors', ['danger']);
  const [warningColor] = useToken('colors', ['warning']);
  const [light] = useToken('colors', ['light.0']);
  const [dark] = useToken('colors', ['dark.200']);
  const [darkContrast] = useToken('colors', ['dark.200']);
  const t = useTranslations('alerts');

  const darkenColor = tinycolor(primaryColor).darken(10).toString();

  const createToast = ({
    title,
    description,
    duration = 2000,
    closable = false,
    type,
  }: ToastOptions) => {
    toaster.create({
      title,
      description,
      duration,
      closable,
      type,
    });
  };

  const toastSuccess = (title: string, description?: string) => {
    createToast({
      title: title || t('successTitle') || 'Success',
      description,
      type: 'success',
    });
  };

  const toastWarning = (title: string, description?: string) => {
    toaster.create({
      title: title || t('warningTitle') || 'Warning',
      description,
      type: 'warning',
    });
  };

  const toastError = (title: string, description?: string) => {
    toaster.create({
      title: title || t('errorTitle') || 'Error',
      description,
      type: 'error',
    });
  };

  const toastInfo = (title: string, description?: string) => {
    toaster.create({
      title: title || t('infoTitle') || 'Info',
      description,
      type: 'info',
    });
  };

  const confirmAlert = (
    title: string,
    text: string = '',
    confirmButtonText: string = t('acceptText'),
    denyButtonText: string = t('cancelText')
  ) => {
    return new Promise((resolve) =>
      Swal.fire({
        title,
        text,
        showDenyButton: true,
        confirmButtonColor: darkenColor,
        denyButtonColor: dangerColor,
        background: theme === 'dark' ? darkContrast : light,
        iconColor: warningColor,
        color: theme === 'dark' ? light : dark,
        customClass: {
          title: 'swal2-custom-title',
          popup: 'swal2-custom-rounded',
          confirmButton: 'swal2-custom-button',
          denyButton: 'swal2-custom-button',
          cancelButton: 'swal2-custom-button',
        },
        confirmButtonText,
        denyButtonText,
        icon: 'warning',
      }).then((result) => resolve(result.isConfirmed))
    );
  };

  return {
    confirmAlert,
    toastSuccess,
    toastError,
    toastInfo,
    toastWarning,
  };
};
