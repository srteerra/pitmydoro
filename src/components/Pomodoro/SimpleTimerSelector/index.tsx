import { Box, Editable } from '@chakra-ui/react';
import useSessionStore from '@/stores/Session.store';

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
            color='gray.800'
            style={{
              display: 'inline',
              fontWeight: 600,
              cursor: 'text',
              padding: 10,
              background: 'none',
            }}
          />
          <Editable.Input
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
  const timerDuration = useSessionStore((state) => state.timerDuration);
  const setTimerDuration = useSessionStore((state) => state.setTimerDuration);
  const shortBreakDuration = useSessionStore((state) => state.shortBreakDuration);
  const setShortBreakDuration = useSessionStore((state) => state.setShortBreakDuration);
  const longBreakDuration = useSessionStore((state) => state.longBreakDuration);
  const setLongBreakDuration = useSessionStore((state) => state.setLongBreakDuration);

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
      <DurationEditable value={timerDuration} onChange={setTimerDuration} accent='#e05c5c' /> mins,
      descanso corto de{' '}
      <DurationEditable
        value={shortBreakDuration}
        onChange={setShortBreakDuration}
        accent='#5c9ee0'
      />{' '}
      mins y descanso largo de{' '}
      <DurationEditable
        value={longBreakDuration}
        onChange={setLongBreakDuration}
        accent='#5cc9a0'
      />{' '}
      mins.
    </Box>
  );
};
