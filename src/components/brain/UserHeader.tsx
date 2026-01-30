'use client';

import { LiffProfile } from '@/lib/liff';
import styles from './login.module.css';

interface UserHeaderProps {
  profile: LiffProfile;
  onLogout: () => void;
}

export function UserHeader({ profile, onLogout }: UserHeaderProps) {
  return (
    <div className={styles.userHeader}>
      {profile.pictureUrl ? (
        <img
          src={profile.pictureUrl}
          alt={profile.displayName}
          className={styles.userAvatar}
        />
      ) : (
        <div className={styles.userAvatarPlaceholder}>
          {profile.displayName.charAt(0).toUpperCase()}
        </div>
      )}

      <div className={styles.userInfo}>
        <p className={styles.userName}>{profile.displayName}</p>
        {profile.statusMessage && (
          <p className={styles.userStatus}>{profile.statusMessage}</p>
        )}
      </div>

      <button className={styles.logoutButton} onClick={onLogout}>
        ออกจากระบบ
      </button>
    </div>
  );
}
