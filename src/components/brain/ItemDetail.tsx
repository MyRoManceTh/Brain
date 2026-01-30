'use client';

import { BrainItem } from '@/lib/db/types';
import styles from './brain.module.css';

interface ItemDetailProps {
  item: BrainItem;
  onClose: () => void;
  onDelete?: () => void;
}

export function ItemDetail({ item, onClose, onDelete }: ItemDetailProps) {
  const typeLabels = {
    text: '📝 ข้อความ',
    image: '🖼️ รูปภาพ',
    link: '🔗 ลิงก์',
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles.detailOverlay} onClick={onClose}>
      <div className={styles.detailPanel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.detailHeader}>
          <span className={styles.detailType}>{typeLabels[item.type]}</span>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.detailContent}>
          {item.title && <h2 className={styles.detailTitle}>{item.title}</h2>}

          {item.type === 'image' && item.image_url && (
            <div className={styles.detailImage}>
              <img src={item.image_url} alt={item.title || 'Image'} />
            </div>
          )}

          {item.type === 'link' && (
            <div className={styles.detailLinkPreview}>
              {item.link_preview?.image && (
                <img
                  src={item.link_preview.image}
                  alt=""
                  className={styles.detailLinkImage}
                />
              )}
              <div className={styles.detailLinkInfo}>
                <h3>{item.link_preview?.title || 'Link'}</h3>
                {item.link_preview?.description && (
                  <p>{item.link_preview.description}</p>
                )}
                {item.link_url && (
                  <a
                    href={item.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.detailLinkUrl}
                  >
                    เปิดลิงก์ →
                  </a>
                )}
              </div>
            </div>
          )}

          {item.type === 'text' && (
            <div className={styles.detailText}>
              <p>{item.content}</p>
            </div>
          )}

          {item.ai_summary && (
            <div className={styles.detailSummary}>
              <h4>✨ สรุปโดย AI</h4>
              <p>{item.ai_summary}</p>
            </div>
          )}

          {item.category && (
            <div className={styles.detailCategory}>
              <span className={styles.categoryLabel}>หมวดหมู่:</span>
              <span className={styles.categoryValue}>{item.category}</span>
            </div>
          )}

          {item.tags.length > 0 && (
            <div className={styles.detailTags}>
              <span className={styles.tagsLabel}>Tags:</span>
              <div className={styles.tagsList}>
                {item.tags.map((tag) => (
                  <span key={tag} className={styles.detailTag}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className={styles.detailMeta}>
            <span>สร้างเมื่อ: {formatDate(item.created_at)}</span>
            {item.updated_at !== item.created_at && (
              <span>แก้ไขล่าสุด: {formatDate(item.updated_at)}</span>
            )}
          </div>
        </div>

        <div className={styles.detailActions}>
          {onDelete && (
            <button className={styles.deleteButton} onClick={onDelete}>
              🗑️ ลบ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
