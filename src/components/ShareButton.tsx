'use client';

/**
 * LINE Mini App - Share Button Component
 */

import React, { useState } from 'react';
import { useLiffMessages } from '@/lib/liff';
import type { FlexMessage } from '@/lib/liff';
import styles from './ShareButton.module.css';

interface ShareButtonProps {
  message: string | FlexMessage;
  buttonText?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  disabled?: boolean;
}

export function ShareButton({
  message,
  buttonText = 'แชร์',
  onSuccess,
  onError,
  className,
  disabled,
}: ShareButtonProps) {
  const { shareMessage, sending, error } = useLiffMessages();
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    try {
      const messages =
        typeof message === 'string'
          ? [{ type: 'text' as const, text: message }]
          : [message];

      const result = await shareMessage(messages);

      if (result?.status === 'success') {
        setShared(true);
        onSuccess?.();
        setTimeout(() => setShared(false), 2000);
      }
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error('Share failed'));
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={disabled || sending}
      className={`${styles.button} ${shared ? styles.success : ''} ${className || ''}`}
    >
      {sending ? (
        <span className={styles.loading}>กำลังแชร์...</span>
      ) : shared ? (
        <span className={styles.successText}>แชร์แล้ว!</span>
      ) : (
        <>
          <svg
            className={styles.icon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16,6 12,2 8,6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          {buttonText}
        </>
      )}
      {error && <span className={styles.error}>{error.message}</span>}
    </button>
  );
}

export default ShareButton;
