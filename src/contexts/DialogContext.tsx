'use client';

import { ComponentType, createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState, } from 'react';
import { Button, CloseButton, Dialog } from '@chakra-ui/react';
import { Portal } from '@zag-js/react';

type DialogContent = ComponentType<{ onClose: () => void }> | ReactNode;

type CloseGuard = () => boolean | Promise<boolean>;

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
  setCloseGuard: (guard: CloseGuard | null) => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<DialogOptions | null>(null);
  const closeGuardRef = useRef<CloseGuard | null>(null);

  const openDialog = useCallback((opts: DialogOptions) => {
    closeGuardRef.current = null;
    setOptions(opts);
    setIsOpen(true);
  }, []);

  const performClose = useCallback(() => {
    closeGuardRef.current = null;
    setIsOpen(false);

    setTimeout(() => {
      options?.onClose?.();
      setOptions(null);
    }, 200);
  }, [options]);

  const closeDialog = useCallback(async () => {
    const guard = closeGuardRef.current;
    if (guard && !(await guard())) return;

    performClose();
  }, [performClose]);

  const setCloseGuard = useCallback((guard: CloseGuard | null) => {
    closeGuardRef.current = guard;
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  function resolveBody(): ReactNode {
    const content = options?.component;
    if (!content) return null;

    if (typeof content === 'function') {
      const Component = content as ComponentType<{ onClose: () => void }>;
      return <Component onClose={closeDialog} />;
    }

    return content as ReactNode;
  }

  return (
    <DialogContext.Provider value={{ openDialog, closeDialog, setCloseGuard }}>
      {children}

      <Dialog.Root
        open={isOpen}
        onExitComplete={performClose}
        closeOnInteractOutside={true}
        onInteractOutside={closeDialog}
        persistentElements={[() => document.querySelector('.swal2-container')]}
        size={options?.size ?? 'md'}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content
              borderRadius={'3xl'}
              backgroundColor={{ base: 'gray.50', _dark: 'dark.200' }}
            >
              <Dialog.CloseTrigger asChild>
                <CloseButton
                  onClick={closeDialog}
                  size='sm'
                  position='absolute'
                  top='3'
                  right='3'
                  zIndex='1'
                />
              </Dialog.CloseTrigger>
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
