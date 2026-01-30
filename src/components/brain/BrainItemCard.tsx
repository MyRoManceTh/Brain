'use client';

import { BrainItem } from '@/lib/db/types';
import styles from './brain.module.css';

interface BrainItemCardProps {
  item: BrainItem;
  onClick?: () => void;
}

export function BrainItemCard({ item, onClick }: BrainItemCardProps) {
  const typeIcons = {
    text: '📝',
    image: '🖼️',
    link: '🔗',
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const truncate = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className={styles.itemCard} onClick={onClick}>
      <div className={styles.itemHeader}>
        <span className={styles.typeIcon}>{typeIcons[item.type]}</span>
        <span className={styles.itemDate}>{formatDate(item.created_at)}</span>
      </div>

      {item.title && (
        <h3 className={styles.itemTitle}>{truncate(item.title, 50)}</h3>
      )}

      {item.type === 'image' && item.image_url && (
        <div className={styles.imagePreview}>
          <img src={item.image_url} alt={item.title || 'Image'} />
        </div>
      )}

      {item.type === 'link' && item.link_preview && (
        <div className={styles.linkPreview}>
          {item.link_preview.image && (
            <img src={item.link_preview.image} alt="" className={styles.linkImage} />
          )}
          <div className={styles.linkInfo}>
            <span className={styles.linkTitle}>{item.link_preview.title}</span>
            {item.link_preview.siteName && (
              <span className={styles.linkSite}>{item.link_preview.siteName}</span>
            )}
          </div>
        </div>
      )}

      {item.type === 'text' && (
        <p className={styles.itemContent}>{truncate(item.content, 100)}</p>
      )}

      {item.ai_summary && (
        <p className={styles.aiSummary}>
          <span className={styles.aiIcon}>✨</span>
          {truncate(item.ai_summary, 80)}
        </p>
      )}

      {item.tags.length > 0 && (
        <div className={styles.tags}>
          {item.tags.slice(0, 3).map((tag) => (
            <span key={tag} className={styles.tag}>
              #{tag}
            </span>
          ))}
          {item.tags.length > 3 && (
            <span className={styles.tagMore}>+{item.tags.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
}
