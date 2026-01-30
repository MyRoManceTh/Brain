'use client';

/**
 * LINE Mini App - QR Scanner Component
 */

import React from 'react';
import { useLiffScanner } from '@/lib/liff';
import { useLiffContext } from './LiffProvider';
import styles from './QRScanner.module.css';

interface QRScannerProps {
  onScan?: (value: string) => void;
  onError?: (error: Error) => void;
  buttonText?: string;
  className?: string;
}

export function QRScanner({
  onScan,
  onError,
  buttonText = 'สแกน QR Code',
  className,
}: QRScannerProps) {
  const { isInClient } = useLiffContext();
  const { scan, result, scanning, error, reset } = useLiffScanner();

  const handleScan = async () => {
    try {
      const value = await scan();
      onScan?.(value);
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error('Scan failed'));
    }
  };

  if (!isInClient) {
    return (
      <div className={`${styles.container} ${className || ''}`}>
        <p className={styles.notAvailable}>
          QR Scanner ใช้งานได้เฉพาะในแอป LINE เท่านั้น
        </p>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <button
        onClick={handleScan}
        disabled={scanning}
        className={styles.scanButton}
      >
        {scanning ? (
          <span className={styles.loading}>กำลังสแกน...</span>
        ) : (
          <>
            <svg
              className={styles.icon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
            {buttonText}
          </>
        )}
      </button>

      {result && (
        <div className={styles.result}>
          <p className={styles.resultLabel}>ผลลัพธ์:</p>
          <code className={styles.resultValue}>{result}</code>
          <button onClick={reset} className={styles.resetButton}>
            สแกนใหม่
          </button>
        </div>
      )}

      {error && <p className={styles.error}>{error.message}</p>}
    </div>
  );
}

export default QRScanner;
