'use client';

/**
 * LINE Mini App - LIFF Context Provider
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useLiff } from '@/lib/liff';
import type { LiffProfile, LiffContext as LiffContextType, LiffOS } from '@/lib/liff';

interface LiffContextValue {
  isInitialized: boolean;
  isLoggedIn: boolean;
  isInClient: boolean;
  isLoading: boolean;
  error: Error | null;
  profile: LiffProfile | null;
  context: LiffContextType | null;
  os: LiffOS | null;
  login: (redirectUri?: string) => void;
  logout: () => void;
}

const LiffContext = createContext<LiffContextValue | null>(null);

interface LiffProviderProps {
  liffId: string;
  children: ReactNode;
}

export function LiffProvider({ liffId, children }: LiffProviderProps) {
  const liff = useLiff(liffId);

  return <LiffContext.Provider value={liff}>{children}</LiffContext.Provider>;
}

export function useLiffContext(): LiffContextValue {
  const context = useContext(LiffContext);
  if (!context) {
    throw new Error('useLiffContext must be used within a LiffProvider');
  }
  return context;
}

export default LiffProvider;
