'use client';

import { ContentType } from '@/lib/db/types';
import styles from './brain.module.css';

interface FilterTabsProps {
  activeType: ContentType | null;
  onTypeChange: (type: ContentType | null) => void;
}

const tabs: { type: ContentType | null; label: string; icon: string }[] = [
  { type: null, label: 'ทั้งหมด', icon: '📋' },
  { type: 'text', label: 'ข้อความ', icon: '📝' },
  { type: 'image', label: 'รูปภาพ', icon: '🖼️' },
  { type: 'link', label: 'ลิงก์', icon: '🔗' },
];

export function FilterTabs({ activeType, onTypeChange }: FilterTabsProps) {
  return (
    <div className={styles.filterTabs}>
      {tabs.map(({ type, label, icon }) => (
        <button
          key={type ?? 'all'}
          className={`${styles.filterTab} ${activeType === type ? styles.active : ''}`}
          onClick={() => onTypeChange(type)}
        >
          <span className={styles.tabIcon}>{icon}</span>
          <span className={styles.tabLabel}>{label}</span>
        </button>
      ))}
    </div>
  );
}
