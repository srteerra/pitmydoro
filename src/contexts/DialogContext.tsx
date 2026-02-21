'use client';

import {
  createContext,
  useState,
  useCallback,
  ReactNode,
  ComponentType,
  useContext,
  useEffect,
} from 'react';
import { Button, CloseButton, Dialog } from '@chakra-ui/react';
import { Portal } from '@zag-js/react';

type DialogContent = ComponentType<{ onClose: () => void }> | ReactNode;

export interface DialogOptions {
  title: string;
  component: DialogContent;
  onClose?: () => void;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  onSubmit?: () => void;
}

interface DialogContextValue {
  openDialog: (options: DialogOptions) => void;
  closeDialog: () => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<DialogOptions | null>(null);

  const openDialog = useCallback((opts: DialogOptions) => {
    setOptions(opts);
    setIsOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);

    setTimeout(() => {
      options?.onClose?.();
      setOptions(null);
    }, 200);
  }, [options]);

  function resolveBody(): ReactNode {
    const content = options?.component;
    if (!content) return null;

    if (typeof content === 'function') {
      const Component = content as ComponentType<{ onClose: () => void }>;
      return <Component onClose={closeDialog} />;
    }

    return content as ReactNode;
  }

  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.documentElement.style.overflow = '';
      document.documentElement.style.paddingRight = '';
    }
  }, [isOpen]);

  return (
    <DialogContext.Provider value={{ openDialog, closeDialog }}>
      {children}

      <Dialog.Root
        open={isOpen}
        onExitComplete={closeDialog}
        closeOnInteractOutside={true}
        onInteractOutside={closeDialog}
        size={options?.size ?? 'md'}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content
              borderRadius={'3xl'}
              backgroundColor={{ base: 'gray.50', _dark: 'dark.200' }}
            >
              <Dialog.CloseTrigger />
              <Dialog.Header>
                {options?.title && <Dialog.Title>{options.title}</Dialog.Title>}
              </Dialog.Header>
              <Dialog.Body>{resolveBody()}</Dialog.Body>
              <Dialog.Footer>
                {options?.onSubmit && (
                  <>
                    <Dialog.ActionTrigger asChild>
                      <Button variant='outline' onClick={() => setIsOpen(false)}>
                        Cancel
                      </Button>
                    </Dialog.ActionTrigger>
                    <Button>Save</Button>
                  </>
                )}
              </Dialog.Footer>

              {options?.onSubmit && (
                <Dialog.CloseTrigger asChild>
                  <CloseButton onClick={() => setIsOpen(false)} size='sm' />
                </Dialog.CloseTrigger>
              )}
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </DialogContext.Provider>
  );
}

export function useDialog(): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error('useDialog must be used inside <DialogProvider>');
  }
  return ctx;
}
