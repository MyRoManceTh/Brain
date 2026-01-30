'use client';

import styles from './brain.module.css';

interface Tag {
  tag: string;
  count: number;
}

interface TagCloudProps {
  tags: Tag[];
  selectedTag?: string;
  onTagClick: (tag: string | undefined) => void;
  maxTags?: number;
}

export function TagCloud({
  tags,
  selectedTag,
  onTagClick,
  maxTags = 10,
}: TagCloudProps) {
  const displayTags = tags.slice(0, maxTags);

  if (displayTags.length === 0) {
    return null;
  }

  return (
    <div className={styles.tagCloud}>
      <span className={styles.tagCloudLabel}>Tags:</span>
      <div className={styles.tagCloudItems}>
        {selectedTag && (
          <button
            className={`${styles.tagCloudItem} ${styles.clearTag}`}
            onClick={() => onTagClick(undefined)}
          >
            ✕ ล้างตัวกรอง
          </button>
        )}
        {displayTags.map(({ tag, count }) => (
          <button
            key={tag}
            className={`${styles.tagCloudItem} ${
              selectedTag === tag ? styles.selected : ''
            }`}
            onClick={() => onTagClick(selectedTag === tag ? undefined : tag)}
          >
            #{tag} <span className={styles.tagCount}>({count})</span>
          </button>
        ))}
      </div>
    </div>
  );
}
