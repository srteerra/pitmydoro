'use client';

import { Pomodoro } from '@/components/Pomodoro';
import React, { useEffect, useState } from 'react';
import { SCUDERIAS } from '@/constants/Scuderias';
import useSettingsStore from '@/stores/Settings.store';
import { SimpleTimerSelector } from '@/components/Pomodoro/SimpleTimerSelector';
import { PomodoroMode } from '@/interfaces/Settings.interface';
import { Container } from '@chakra-ui/react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const mode = useSettingsStore((state) => state.mode);
  const currentScuderia = useSettingsStore((state) => state.currentScuderia);
  const setCurrentScuderia = useSettingsStore((state) => state.setCurrentScuderia);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!currentScuderia && !!SCUDERIAS.length) {
      setCurrentScuderia(SCUDERIAS.find((team) => team.name === 'Ferrari') || SCUDERIAS[0]);
    }
  }, [currentScuderia, setCurrentScuderia]);

  return (
    <Container minHeight={'80vh'}>
      {mounted && (
        <>
          {mode === PomodoroMode.MINIMAL && <SimpleTimerSelector />}
          <Pomodoro />
        </>
      )}
    </Container>
  );
}
