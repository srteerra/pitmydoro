import { Box, Editable } from '@chakra-ui/react';
import useSettingsStore from '@/stores/Settings.store';
import { SessionStatusEnum } from '@/enums/SessionStatus.enum';
import { MAX_DURATION } from '@/constants/DefaultSettings';
import { useAlert } from '@/hooks/useAlert';
import { useTranslations } from 'use-intl';
import { useCallback } from 'react';

interface DurationEditableProps {
  value: number;
  onChange: (val: number) => void;
  accent: string;
}

const DurationEditable = ({ value, onChange, accent }: DurationEditableProps) => (
  <Editable.Root
    value={String(value)}
    onValueChange={(e) => {
      const n = Number(e.value);
      if (!isNaN(n) && n > 0) onChange(n);
    }}
    style={{ display: 'inline' }}
    fontSize='18px'
  >
    <Editable.Context>
      {(ctx) => (
        <Box
          as='span'
          display='inline'
          cursor='text'
          fontSize='18px'
          style={{
            borderBottom: `1.5px dashed ${accent}99`,
            paddingBottom: '1px',
            transition: 'border-color 0.2s',
            ...(ctx.editing && { borderBottom: `1.5px solid ${accent}` }),
          }}
        >
          <Editable.Preview
            color={{ base: 'gray.800', _dark: 'white' }}
            style={{
              display: 'inline',
              fontWeight: 600,
              cursor: 'text',
              padding: 10,
              background: 'none',
            }}
          />
          <Editable.Input
            onKeyDown={(e) => {
              if (!/^\d$/.test(e.key)) return;
              const input = e.currentTarget;
              const next =
                input.value.slice(0, input.selectionStart ?? input.value.length) +
                e.key +
                input.value.slice(input.selectionEnd ?? input.value.length);
              if (Number(next) > MAX_DURATION) {
                e.preventDefault();
                onChange(Number(next));
                ctx.cancel();
              }
            }}
            style={{
              display: 'inline',
              fontWeight: 600,
              width: `${String(value).length + 1}ch`,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              padding: 0,
              textAlign: 'center',
            }}
          />
        </Box>
      )}
    </Editable.Context>
  </Editable.Root>
);

export const SimpleTimerSelector = () => {
  const minimalSessionDuration = useSettingsStore((state) => state.minimalSessionDuration);
  const setMinimalSessionDuration = useSettingsStore((state) => state.setMinimalSessionDuration);
  const breaksDuration = useSettingsStore((state) => state.breaksDuration);
  const updateBreakDuration = useSettingsStore((state) => state.updateBreakDuration);
  const { toastError } = useAlert();
  const t = useTranslations('settings.sections.timers');

  const validateDuration = useCallback(
    (value: number): number => {
      if (value > MAX_DURATION) {
        toastError(t('maxDurationExceeded', { max: MAX_DURATION }));
        return MAX_DURATION;
      }
      return Math.max(1, value);
    },
    [toastError, t]
  );

  return (
    <Box
      fontSize='13px'
      fontWeight={500}
      color='gray.500'
      lineHeight='2'
      textAlign={'center'}
      userSelect='none'
      marginBottom={'40px'}
      marginTop={'30px'}
      style={{ display: 'block' }}
    >
      Sesión de{' '}
      <DurationEditable
        value={minimalSessionDuration}
        onChange={(val) => setMinimalSessionDuration(validateDuration(val))}
        accent='#e05c5c'
      />{' '}
      mins, descanso corto de{' '}
      <DurationEditable
        value={breaksDuration[SessionStatusEnum.SHORT_BREAK]}
        onChange={(val) =>
          updateBreakDuration(SessionStatusEnum.SHORT_BREAK, validateDuration(val))
        }
        accent='#5c9ee0'
      />{' '}
      mins y descanso largo de{' '}
      <DurationEditable
        value={breaksDuration[SessionStatusEnum.LONG_BREAK]}
        onChange={(val) => updateBreakDuration(SessionStatusEnum.LONG_BREAK, validateDuration(val))}
        accent='#5cc9a0'
      />{' '}
      mins.
    </Box>
  );
};
