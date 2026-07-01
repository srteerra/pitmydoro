'use client';

import { createToaster, Portal, Spinner, Stack, Toast, Toaster as ChakraToaster, } from '@chakra-ui/react';

export const toaster = createToaster({
  placement: 'bottom-end',
  pauseOnPageIdle: true,
  max: 4,
});

const TYPE_TOKEN: Record<string, string> = {
  success: 'success',
  error: 'danger',
  warning: 'warning',
};

export const Toaster = () => {
  return (
    <Portal>
      <ChakraToaster toaster={toaster} insetInline={{ mdDown: '4' }}>
        {(toast) => {
          const token = TYPE_TOKEN[toast.type ?? ''];

          return (
            <Toast.Root
              width={{ md: 'sm' }}
              bg={token ? `${token}.subtle` : undefined}
              color={token ? `${token}.fg` : undefined}
              borderWidth={token ? '1px' : undefined}
              borderColor={token ? `${token}.muted` : undefined}
            >
              {toast.type === 'loading' ? (
                <Spinner size='sm' color='blue.solid' />
              ) : (
                <Toast.Indicator />
              )}
              <Stack gap='1' flex='1' maxWidth='100%'>
                {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
                {toast.description && <Toast.Description>{toast.description}</Toast.Description>}
              </Stack>
              {toast.action && <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>}
              {toast.closable && <Toast.CloseTrigger />}
            </Toast.Root>
          );
        }}
      </ChakraToaster>
    </Portal>
  );
};
