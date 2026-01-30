'use client';

/**
 * LINE Mini App - User Profile Card Component
 */

import React from 'react';
import Image from 'next/image';
import { useLiffContext } from './LiffProvider';
import styles from './ProfileCard.module.css';

interface ProfileCardProps {
  showStatusMessage?: boolean;
  className?: string;
}

export function ProfileCard({ showStatusMessage = true, className }: ProfileCardProps) {
  const { profile, isLoading, isLoggedIn, login } = useLiffContext();

  if (isLoading) {
    return (
      <div className={`${styles.card} ${styles.loading} ${className || ''}`}>
        <div className={styles.skeleton} />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className={`${styles.card} ${styles.notLoggedIn} ${className || ''}`}>
        <p>กรุณาเข้าสู่ระบบ</p>
        <button onClick={() => login()} className={styles.loginButton}>
          เข้าสู่ระบบด้วย LINE
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`${styles.card} ${className || ''}`}>
        <p>ไม่สามารถโหลดข้อมูลผู้ใช้</p>
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${className || ''}`}>
      {profile.pictureUrl && (
        <div className={styles.avatarWrapper}>
          <Image
            src={profile.pictureUrl}
            alt={profile.displayName}
            width={80}
            height={80}
            className={styles.avatar}
          />
        </div>
      )}
      <div className={styles.info}>
        <h3 className={styles.displayName}>{profile.displayName}</h3>
        {showStatusMessage && profile.statusMessage && (
          <p className={styles.statusMessage}>{profile.statusMessage}</p>
        )}
      </div>
    </div>
  );
}

export default ProfileCard;
