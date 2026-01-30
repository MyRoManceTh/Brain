'use client';

import { LiffProvider } from '@/components/LiffProvider';

const liffId = process.env.NEXT_PUBLIC_LIFF_ID || '';

export default function BrainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LiffProvider liffId={liffId}>{children}</LiffProvider>;
}
