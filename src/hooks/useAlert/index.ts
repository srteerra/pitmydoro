import Swal, { SweetAlertIcon } from 'sweetalert2';
import { useToken } from '@chakra-ui/react';
import './styles.css';
import { useTheme } from 'next-themes';
import { toaster } from '@/components/ui/toaster';
import { useTranslations } from 'use-intl';

type ToastType = 'success' | 'error' | 'info' | 'warning';

type AlertType = 'danger' | 'warning' | 'success' | 'question';

const STATUS_ACCENT: Record<AlertType, { base: string; dark: string; icon: SweetAlertIcon }> = {
  danger: { base: '#da8787', dark: '#b96060', icon: 'error' },
  warning: { base: '#d9b471', dark: '#b69258', icon: 'warning' },
  success: { base: '#6db98c', dark: '#53a473', icon: 'success' },
  question: { base: '#6b84b4', dark: '#4e6ca1', icon: 'question' },
};

interface ToastOptions {
  title: string;
  description?: string;
  duration?: number;
  closable?: boolean;
  type?: ToastType;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const useAlert = () => {
  const { theme } = useTheme();
  const [light] = useToken('colors', ['light.0']);
  const [dark] = useToken('colors', ['dark.200']);
  const [darkContrast] = useToken('colors', ['dark.200']);
  const t = useTranslations('alerts');

  const isDark = theme === 'dark';

  const createToast = ({
    title,
    description,
    duration = 2000,
    closable = false,
    type,
    action,
  }: ToastOptions) => {
    toaster.create({
      title,
      description,
      duration,
      closable,
      type,
      action,
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

  const toastWithAction = ({
    title,
    actionLabel,
    type,
    onActionClick,
    description,
    duration,
  }: {
    title: string;
    description?: string;
    type?: ToastType;
    actionLabel: string;
    onActionClick: () => void;
    duration?: number;
  }) => {
    toaster.create({
      title: title || t('infoTitle') || 'Info',
      description,
      type,
      duration,
      action: {
        label: actionLabel,
        onClick: onActionClick,
      },
    });
  };

  const confirmAlert = (
    title: string,
    options: {
      text?: string;
      confirmButtonText?: string;
      denyButtonText?: string;
      type?: AlertType;
    } = {}
  ) => {
    const {
      text = '',
      confirmButtonText = t('acceptText'),
      denyButtonText = t('cancelText'),
      type = 'warning',
    } = options;

    const accent = STATUS_ACCENT[type];
    const accentColor = isDark ? accent.dark : accent.base;
    const neutralColor = isDark ? '#404040' : '#8A8A8A';

    return new Promise((resolve) =>
      Swal.fire({
        title,
        text,
        showDenyButton: true,
        confirmButtonColor: accentColor,
        denyButtonColor: neutralColor,
        background: isDark ? darkContrast : light,
        iconColor: accentColor,
        color: isDark ? light : dark,
        customClass: {
          title: 'swal2-custom-title',
          popup: 'swal2-custom-rounded',
          confirmButton: 'swal2-custom-button',
          denyButton: 'swal2-custom-button',
          cancelButton: 'swal2-custom-button',
        },
        confirmButtonText,
        denyButtonText,
        icon: accent.icon,
        didOpen: () => {
          const container = Swal.getContainer();
          if (container) {
            container.style.zIndex = '2000';
            container.style.pointerEvents = 'auto';
          }
        },
      }).then((result) => resolve(result.isConfirmed))
    );
  };

  return {
    confirmAlert,
    toastSuccess,
    toastError,
    toastInfo,
    toastWithAction,
    toastWarning,
  };
};
