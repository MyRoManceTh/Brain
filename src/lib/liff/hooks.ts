/**
 * LINE Mini App - React Hooks for LIFF
 */

import { useState, useEffect, useCallback } from 'react';
import { liffClient } from './client';
import type { LiffProfile, LiffContext, LiffOS } from './types';

interface UseLiffReturn {
  isInitialized: boolean;
  isLoggedIn: boolean;
  isInClient: boolean;
  isLoading: boolean;
  error: Error | null;
  profile: LiffProfile | null;
  context: LiffContext | null;
  os: LiffOS | null;
  login: (redirectUri?: string) => void;
  logout: () => void;
}

/**
 * Main hook for LIFF integration
 */
export function useLiff(liffId: string): UseLiffReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInClient, setIsInClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [profile, setProfile] = useState<LiffProfile | null>(null);
  const [context, setContext] = useState<LiffContext | null>(null);
  const [os, setOs] = useState<LiffOS | null>(null);

  useEffect(() => {
    const initLiff = async () => {
      try {
        setIsLoading(true);
        setError(null);

        await liffClient.init({ liffId });
        setIsInitialized(true);
        setIsLoggedIn(liffClient.isLoggedIn());
        setIsInClient(liffClient.isInClient());
        setOs(liffClient.getOS());
        setContext(liffClient.getContext());

        // Get profile if logged in
        if (liffClient.isLoggedIn()) {
          try {
            const userProfile = await liffClient.getProfile();
            setProfile(userProfile);
          } catch (profileError) {
            console.warn('Could not get profile:', profileError);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('LIFF initialization failed'));
      } finally {
        setIsLoading(false);
      }
    };

    initLiff();
  }, [liffId]);

  const login = useCallback((redirectUri?: string) => {
    liffClient.login(redirectUri);
  }, []);

  const logout = useCallback(() => {
    liffClient.logout();
    setIsLoggedIn(false);
    setProfile(null);
  }, []);

  return {
    isInitialized,
    isLoggedIn,
    isInClient,
    isLoading,
    error,
    profile,
    context,
    os,
    login,
    logout,
  };
}

/**
 * Hook for getting user profile
 */
export function useLiffProfile() {
  const [profile, setProfile] = useState<LiffProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!liffClient.isInitialized() || !liffClient.isLoggedIn()) {
          setLoading(false);
          return;
        }

        const userProfile = await liffClient.getProfile();
        setProfile(userProfile);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to get profile'));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return { profile, loading, error };
}

/**
 * Hook for sending messages
 */
export function useLiffMessages() {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendText = useCallback(async (text: string) => {
    try {
      setSending(true);
      setError(null);
      await liffClient.sendTextMessage(text);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to send message'));
      throw err;
    } finally {
      setSending(false);
    }
  }, []);

  const shareMessage = useCallback(
    async (messages: Parameters<typeof liffClient.shareTargetPicker>[0]) => {
      try {
        setSending(true);
        setError(null);
        return await liffClient.shareTargetPicker(messages);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to share message'));
        throw err;
      } finally {
        setSending(false);
      }
    },
    []
  );

  return { sendText, shareMessage, sending, error };
}

/**
 * Hook for QR code scanning
 */
export function useLiffScanner() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const scan = useCallback(async () => {
    try {
      setScanning(true);
      setError(null);
      const scanResult = await liffClient.scanCode();
      setResult(scanResult.value);
      return scanResult.value;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to scan code'));
      throw err;
    } finally {
      setScanning(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { scan, result, scanning, error, reset };
}

/**
 * Hook for permissions
 */
export function useLiffPermissions() {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        if (!liffClient.isInitialized()) {
          setLoading(false);
          return;
        }

        const granted = await liffClient.getGrantedPermissions();
        setPermissions(granted);
      } catch (err) {
        console.warn('Could not get permissions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  const hasPermission = useCallback(
    (permission: string) => permissions.includes(permission),
    [permissions]
  );

  return { permissions, loading, hasPermission };
}
