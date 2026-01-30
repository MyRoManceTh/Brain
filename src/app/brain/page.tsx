'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLiffContext } from '@/components/LiffProvider';
import {
  BrainItemCard,
  SearchBar,
  FilterTabs,
  TagCloud,
  AddItemForm,
  ItemDetail,
  LoginScreen,
  UserHeader,
} from '@/components/brain';
import { BrainItem, ContentType } from '@/lib/db/types';
import styles from './brain.module.css';

interface TagData {
  tag: string;
  count: number;
}

export default function BrainDashboard() {
  const { isInitialized, isLoggedIn, isLoading, error: liffError, profile, login, logout } = useLiffContext();

  // State
  const [items, setItems] = useState<BrainItem[]>([]);
  const [tags, setTags] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filters
  const [activeType, setActiveType] = useState<ContentType | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  // UI State
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BrainItem | null>(null);

  const userId = profile?.userId;

  // Fetch items
  const fetchItems = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setFetchError(null);

    try {
      const params = new URLSearchParams({ userId });

      if (activeType) params.append('type', activeType);
      if (selectedTag) params.append('tags', selectedTag);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/brain/items?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch items');
      }

      setItems(data.items || []);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [userId, activeType, selectedTag, searchQuery]);

  // Fetch tags
  const fetchTags = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/brain/tags?userId=${userId}`);
      const data = await response.json();

      if (response.ok) {
        setTags(data.tags || []);
      }
    } catch (err) {
      console.error('Error fetching tags:', err);
    }
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    if (userId) {
      fetchItems();
      fetchTags();
    }
  }, [userId, fetchItems, fetchTags]);

  // Add item
  const handleAddItem = async (content: string) => {
    if (!userId) return;

    const response = await fetch('/api/brain/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, content }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to add item');
    }

    // Refresh list
    await fetchItems();
    await fetchTags();
  };

  // Delete item
  const handleDeleteItem = async (itemId: string) => {
    if (!userId) return;

    const confirmed = confirm('ต้องการลบข้อมูลนี้หรือไม่?');
    if (!confirmed) return;

    const response = await fetch(`/api/brain/items/${itemId}?userId=${userId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setSelectedItem(null);
      await fetchItems();
      await fetchTags();
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Loading state
  if (!isInitialized) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>กำลังโหลด LIFF...</div>
      </div>
    );
  }

  // Not logged in - show login screen
  if (!isLoggedIn) {
    return (
      <LoginScreen
        onLogin={() => login()}
        isLoading={isLoading}
        error={liffError}
      />
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h1>🧠 Second Brain</h1>
        <p className={styles.subtitle}>สมองที่ 2 ของคุณ</p>
      </header>

      {/* User Profile */}
      {profile && (
        <UserHeader profile={profile} onLogout={logout} />
      )}

      {/* Search */}
      <SearchBar onSearch={handleSearch} placeholder="ค้นหาข้อมูล..." />

      {/* Filter Tabs */}
      <FilterTabs activeType={activeType} onTypeChange={setActiveType} />

      {/* Tag Cloud */}
      {tags.length > 0 && (
        <TagCloud
          tags={tags}
          selectedTag={selectedTag}
          onTagClick={setSelectedTag}
        />
      )}

      {/* Error */}
      {fetchError && <div className={styles.error}>{fetchError}</div>}

      {/* Loading */}
      {loading && <div className={styles.loading}>กำลังโหลด...</div>}

      {/* Items List */}
      {!loading && items.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📭</div>
          <p className={styles.emptyText}>
            {searchQuery
              ? 'ไม่พบข้อมูลที่ค้นหา'
              : 'ยังไม่มีข้อมูล\nส่งข้อความ/รูป/link มาที่ LINE Chat เพื่อเริ่มบันทึก!'}
          </p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className={styles.itemsList}>
          {items.map((item) => (
            <BrainItemCard
              key={item.id}
              item={item}
              onClick={() => setSelectedItem(item)}
            />
          ))}
        </div>
      )}

      {/* Add Button (FAB) */}
      <button
        className={styles.addButton}
        onClick={() => setShowAddForm(true)}
      >
        +
      </button>

      {/* Add Form Modal */}
      {showAddForm && (
        <AddItemForm
          onSubmit={handleAddItem}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetail
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onDelete={() => handleDeleteItem(selectedItem.id)}
        />
      )}
    </div>
  );
}
