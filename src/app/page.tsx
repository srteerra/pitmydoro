"use client"
import { Pomodoro } from "@/components/Pomodoro";
import { Head } from "@/components/Head";
import React, { useEffect, useState } from 'react';
import { Loader } from "@/components/Loader";
import { Router } from "next/router";

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleStop = () => setLoading(false);

    handleStop();

    Router.events.on("routeChangeStart", handleStart);
    Router.events.on("routeChangeComplete", handleStop);
    Router.events.on("routeChangeError", handleStop);

    return () => {
      Router.events.off("routeChangeStart", handleStart);
      Router.events.off("routeChangeComplete", handleStop);
      Router.events.off("routeChangeError", handleStop);
    };
  }, []);

  useEffect(() => {
    const isDesktop = () => {
      return !/Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    };

    if (isDesktop() && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);
  
  if (loading) return <Loader />;
  
  return (
    <React.Fragment>
      <Head title={"PitMyDoro"} />
      <Pomodoro />
    </React.Fragment>
  );
}