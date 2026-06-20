import { Box, Editable } from '@chakra-ui/react';
import useSettingsStore from '@/stores/Settings.store';
import { SessionStatusEnum } from '@/enums/SessionStatus.enum';
import { MAX_DURATION } from '@/constants/DefaultSettings';
import { useAlert } from '@/hooks/useAlert';
import { useTranslations } from 'use-intl';
import { CSSProperties, useCallback, useEffect, useState } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { useDebounce } from '@/hooks/useDebounce';

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
          style={
            {
              borderBottom: `1.5px dashed ${accent}99`,
              paddingBottom: '1px',
              transition: 'border-color 0.2s',
              '--edit-accent': accent,
              ...(ctx.editing && {
                borderBottom: `1.5px solid ${accent}`,
                animation: 'editBorderBlink 1.4s ease-in-out infinite',
              }),
            } as CSSProperties
          }
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
  const breaksDuration = useSettingsStore((state) => state.breaksDuration);
  const { handleChangeMinimalSessionDuration, handleChangeBreakDuration } = useSettings();
  const { toastError } = useAlert();
  const t = useTranslations('settings.sections.timers');
  const st = useTranslations('pomodoro.simpleTimer');

  const [localSession, setLocalSession] = useState(minimalSessionDuration);
  const [localBreaks, setLocalBreaks] = useState(breaksDuration);

  const debouncedSession = useDebounce(handleChangeMinimalSessionDuration, 1000);
  const debouncedBreak = useDebounce(handleChangeBreakDuration, 1000);

  useEffect(() => {
    setLocalSession(minimalSessionDuration);
  }, [minimalSessionDuration]);

  useEffect(() => {
    setLocalBreaks(breaksDuration);
  }, [breaksDuration]);

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

  const handleSessionChange = (value: number) => {
    const validated = validateDuration(value);
    setLocalSession(validated);
    debouncedSession(validated);
  };

  const handleBreakChange = (status: SessionStatusEnum, value: number) => {
    const validated = validateDuration(value);
    setLocalBreaks((prev) => ({ ...prev, [status]: validated }));
    debouncedBreak(status, validated);
  };

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
      {st.rich('description', {
        session: () => (
          <>
            <DurationEditable
              value={localSession}
              onChange={handleSessionChange}
              accent='#e05c5c'
            />{' '}
            {st('minutes', { count: localSession })}
          </>
        ),
        shortBreak: () => (
          <>
            <DurationEditable
              value={localBreaks[SessionStatusEnum.SHORT_BREAK]}
              onChange={(val) => handleBreakChange(SessionStatusEnum.SHORT_BREAK, val)}
              accent='#5c9ee0'
            />{' '}
            {st('minutes', { count: localBreaks[SessionStatusEnum.SHORT_BREAK] })}
          </>
        ),
        longBreak: () => (
          <>
            <DurationEditable
              value={localBreaks[SessionStatusEnum.LONG_BREAK]}
              onChange={(val) => handleBreakChange(SessionStatusEnum.LONG_BREAK, val)}
              accent='#5cc9a0'
            />{' '}
            {st('minutes', { count: localBreaks[SessionStatusEnum.LONG_BREAK] })}
          </>
        ),
      })}
    </Box>
  );
};
