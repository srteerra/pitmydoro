'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  ComponentType,
  useEffect,
} from 'react';
import { Drawer, DrawerContent, Button, CloseButton, Text } from '@chakra-ui/react';
import { Portal } from '@zag-js/react';

type DrawerContent = ComponentType<{ onClose: () => void }> | ReactNode;

export interface DrawerOptions {
  title?: string;
  subTitle?: string;
  topTitle?: {
    label: string;
    icon?: ReactNode;
  };
  component: DrawerContent;
  onClose?: () => void;
  offset?: number;
  placement?: 'bottom' | 'top' | 'start' | 'end';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnInteractOutside?: boolean;
  onSubmit?: () => void;
}

interface DrawerContextValue {
  openDrawer: (options: DrawerOptions) => void;
  closeDrawer: () => void;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<DrawerOptions | null>(null);

  const openDrawer = useCallback((opts: DrawerOptions) => {
    setOptions(opts);
    setIsOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
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
      return <Component onClose={closeDrawer} />;
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
    <DrawerContext.Provider value={{ openDrawer, closeDrawer }}>
      {children}

      <Drawer.Root
        open={isOpen}
        onExitComplete={closeDrawer}
        placement={options?.placement ?? 'end'}
        size={options?.size ?? 'md'}
        onInteractOutside={closeDrawer}
        closeOnInteractOutside={options?.closeOnInteractOutside ?? true}
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner padding={options?.offset ?? 0}>
            <Drawer.Content rounded='md'>
              <Drawer.Header display={'flex'} flexDirection={'column'} alignItems={'start'}>
                {options?.topTitle && (
                  <Text opacity={0.6} display={'flex'} alignItems={'center'} gap={2}>
                    {options.topTitle?.icon} {options.topTitle.label}
                  </Text>
                )}
                {options?.title && <Drawer.Title>{options.title}</Drawer.Title>}
                {options?.subTitle && <Text opacity={0.7}>{options.subTitle}</Text>}
              </Drawer.Header>
              <Drawer.Body>{resolveBody()}</Drawer.Body>
              {options?.onSubmit && (
                <Drawer.Footer>
                  <Button variant='outline'>Cancel</Button>
                  <Button>Save</Button>
                </Drawer.Footer>
              )}
              <Drawer.CloseTrigger asChild>
                <CloseButton onClick={() => setIsOpen(false)} size='sm' />
              </Drawer.CloseTrigger>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </DrawerContext.Provider>
  );
}

export function useDrawer(): DrawerContextValue {
  const ctx = useContext(DrawerContext);
  if (!ctx) {
    throw new Error('useDrawer must be used inside <DrawerProvider>');
  }
  return ctx;
}
