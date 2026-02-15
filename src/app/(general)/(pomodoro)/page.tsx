'use client';

import { Pomodoro } from '@/components/Pomodoro';
import React, { useEffect, useState } from 'react';
import { Loader } from '@/components/Loader';
import { Router } from 'next/router';
import { NextSeo } from 'next-seo';
import { useSeo } from '@/hooks/useSEO';
import { SCUDERIAS } from '@/constants/Scuderias';
import useSettingsStore from '@/stores/Settings.store';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const seo = useSeo();
  const currentScuderia = useSettingsStore((state) => state.currentScuderia);
  const setCurrentScuderia = useSettingsStore((state) => state.setCurrentScuderia);

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
    if (!currentScuderia && !!SCUDERIAS.length) {
      setCurrentScuderia(SCUDERIAS.find((team) => team.name === 'Ferrari') || SCUDERIAS[0]);
    }
  }, [currentScuderia, setCurrentScuderia]);

  if (loading) return <Loader />;
  return (
    <>
      <NextSeo {...seo} />
      <Pomodoro />
    </>
  );
}
