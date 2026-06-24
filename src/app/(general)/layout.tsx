import React from 'react';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { Toaster } from '@/components/ui/toaster';
import { ScrollToTop } from '@/components/ScrollToTop';
import { AnnouncementCard } from '@/components/AnnouncementCard';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster />
      <ScrollToTop />
      <Header />
      {children}
      <Footer />
      <AnnouncementCard />
    </>
  );
}
