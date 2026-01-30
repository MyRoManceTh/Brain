'use client';

import { useState, useCallback } from 'react';
import styles from './brain.module.css';

interface AddItemFormProps {
  onSubmit: (content: string) => Promise<void>;
  onClose: () => void;
}

export function AddItemForm({ onSubmit, onClose }: AddItemFormProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!content.trim() || loading) return;

      setLoading(true);
      try {
        await onSubmit(content.trim());
        setContent('');
        onClose();
      } catch (error) {
        console.error('Error adding item:', error);
      } finally {
        setLoading(false);
      }
    },
    [content, loading, onSubmit, onClose]
  );

  return (
    <div className={styles.addItemOverlay} onClick={onClose}>
      <div className={styles.addItemForm} onClick={(e) => e.stopPropagation()}>
        <div className={styles.addItemHeader}>
          <h3>เพิ่มข้อมูลใหม่</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="พิมพ์ข้อความ, วาง URL, หรือใส่โน้ตของคุณ..."
            className={styles.addItemTextarea}
            rows={4}
            autoFocus
          />

          <div className={styles.addItemHint}>
            💡 ใส่ #tag เพื่อเพิ่ม tag อัตโนมัติ
          </div>

          <div className={styles.addItemActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={!content.trim() || loading}
              className={styles.submitButton}
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
