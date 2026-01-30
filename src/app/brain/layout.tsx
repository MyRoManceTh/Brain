'use client';

import { LiffProvider } from '@/components/LiffProvider';

export default function BrainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LiffProvider>{children}</LiffProvider>;
}
