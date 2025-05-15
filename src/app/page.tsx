'use client';
import { Pomodoro } from '@/components/Pomodoro';
import React, { useEffect, useState } from 'react';
import { Loader } from '@/components/Loader';
import { Router } from 'next/router';
import { useTeams } from '@/hooks/useTeams';
import usePomodoroStore from '@/stores/Pomodoro.store';
import { useCookieConsent } from '@/hooks/useCookieConsent';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const { teams } = useTeams();
  const currentScuderia = usePomodoroStore((state) => state.currentScuderia);
  const setCurrentScuderia = usePomodoroStore((state) => state.setCurrentScuderia);

  useCookieConsent();

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleStop = () => setLoading(false);

    handleStop();
    Router.events.on('routeChangeStart', handleStart);
    Router.events.on('routeChangeComplete', handleStop);
    Router.events.on('routeChangeError', handleStop);

    return () => {
      Router.events.off('routeChangeStart', handleStart);
      Router.events.off('routeChangeComplete', handleStop);
      Router.events.off('routeChangeError', handleStop);
    };
  }, []);

  useEffect(() => {
    if (!currentScuderia && teams.length > 0) {
      setCurrentScuderia(teams.find((team) => team.name === 'Ferrari') || teams[0]);
    }
  }, [teams, currentScuderia, setCurrentScuderia]);

  if (loading) return <Loader />;

  return (
    <>
      <Pomodoro />
    </>
  );
}
