'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './admin.module.css';

interface Stats {
  overview: {
    totalItems: number;
    totalUsers: number;
    todayItems: number;
    weekItems: number;
  };
  byType: {
    text: number;
    image: number;
    link: number;
  };
  topTags: Array<{ tag: string; count: number }>;
  topCategories: Array<{ category: string; count: number }>;
}

interface User {
  user_id: string;
  itemCount: number;
  textCount: number;
  imageCount: number;
  linkCount: number;
  lastActive: string;
  firstSeen: string;
}

interface Item {
  id: string;
  user_id: string;
  type: 'text' | 'image' | 'link';
  content: string;
  title?: string;
  tags: string[];
  category?: string;
  created_at: string;
}

type Tab = 'overview' | 'users' | 'items';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected items for bulk delete
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const authHeader = `Bearer ${password}`;

  // Fetch stats
  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: authHeader },
      });
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, [authHeader]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: authHeader },
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, [authHeader]);

  // Fetch items
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.append('type', typeFilter);
      if (userFilter) params.append('userId', userFilter);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/admin/items?${params}`, {
        headers: { Authorization: authHeader },
      });
      if (!res.ok) throw new Error('Failed to fetch items');
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, [authHeader, typeFilter, userFilter, searchQuery]);

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${password}` },
      });

      if (res.ok) {
        setIsAuthenticated(true);
        localStorage.setItem('adminPassword', password);
      } else {
        setAuthError('รหัสผ่านไม่ถูกต้อง');
      }
    } catch {
      setAuthError('เกิดข้อผิดพลาด');
    }
  };

  // Check saved password
  useEffect(() => {
    const saved = localStorage.getItem('adminPassword');
    if (saved) {
      setPassword(saved);
      fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${saved}` },
      }).then((res) => {
        if (res.ok) {
          setIsAuthenticated(true);
        }
      });
    }
  }, []);

  // Load data when tab changes
  useEffect(() => {
    if (!isAuthenticated) return;

    if (activeTab === 'overview') {
      fetchStats();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'items') {
      fetchItems();
    }
  }, [isAuthenticated, activeTab, fetchStats, fetchUsers, fetchItems]);

  // Delete selected items
  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;

    const confirmed = confirm(`ต้องการลบ ${selectedIds.size} รายการหรือไม่?`);
    if (!confirmed) return;

    try {
      const res = await fetch('/api/admin/items', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });

      if (res.ok) {
        setSelectedIds(new Set());
        fetchItems();
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการลบ');
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('adminPassword');
    setIsAuthenticated(false);
    setPassword('');
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Truncate text
  const truncate = (text: string, max: number) => {
    return text.length > max ? text.slice(0, max) + '...' : text;
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <h1>🔐 Admin Login</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="รหัสผ่าน Admin"
              className={styles.input}
            />
            {authError && <p className={styles.errorText}>{authError}</p>}
            <button type="submit" className={styles.loginButton}>
              เข้าสู่ระบบ
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h1>🛠️ Admin Dashboard</h1>
        <button onClick={handleLogout} className={styles.logoutButton}>
          ออกจากระบบ
        </button>
      </header>

      {/* Tabs */}
      <nav className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 ภาพรวม
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'users' ? styles.active : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 ผู้ใช้งาน
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'items' ? styles.active : ''}`}
          onClick={() => setActiveTab('items')}
        >
          📝 ข้อมูล
        </button>
      </nav>

      {/* Error */}
      {error && <div className={styles.error}>{error}</div>}

      {/* Loading */}
      {loading && <div className={styles.loading}>กำลังโหลด...</div>}

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && !loading && (
        <div className={styles.overview}>
          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statIcon}>📦</span>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{stats.overview.totalItems}</span>
                <span className={styles.statLabel}>รายการทั้งหมด</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statIcon}>👥</span>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{stats.overview.totalUsers}</span>
                <span className={styles.statLabel}>ผู้ใช้งาน</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statIcon}>📅</span>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{stats.overview.todayItems}</span>
                <span className={styles.statLabel}>วันนี้</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statIcon}>📈</span>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{stats.overview.weekItems}</span>
                <span className={styles.statLabel}>สัปดาห์นี้</span>
              </div>
            </div>
          </div>

          {/* Type Breakdown */}
          <div className={styles.section}>
            <h2>ประเภทข้อมูล</h2>
            <div className={styles.typeGrid}>
              <div className={styles.typeCard}>
                <span>📝</span>
                <span>{stats.byType.text}</span>
                <span>ข้อความ</span>
              </div>
              <div className={styles.typeCard}>
                <span>🖼️</span>
                <span>{stats.byType.image}</span>
                <span>รูปภาพ</span>
              </div>
              <div className={styles.typeCard}>
                <span>🔗</span>
                <span>{stats.byType.link}</span>
                <span>ลิงก์</span>
              </div>
            </div>
          </div>

          {/* Top Tags */}
          <div className={styles.section}>
            <h2>Tags ยอดนิยม</h2>
            <div className={styles.tagList}>
              {stats.topTags.map(({ tag, count }) => (
                <span key={tag} className={styles.tagItem}>
                  #{tag} <small>({count})</small>
                </span>
              ))}
              {stats.topTags.length === 0 && (
                <span className={styles.emptyText}>ยังไม่มี tags</span>
              )}
            </div>
          </div>

          {/* Top Categories */}
          <div className={styles.section}>
            <h2>หมวดหมู่</h2>
            <div className={styles.categoryList}>
              {stats.topCategories.map(({ category, count }) => (
                <div key={category} className={styles.categoryItem}>
                  <span>{category}</span>
                  <span className={styles.categoryCount}>{count}</span>
                </div>
              ))}
              {stats.topCategories.length === 0 && (
                <span className={styles.emptyText}>ยังไม่มีหมวดหมู่</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && !loading && (
        <div className={styles.usersSection}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User ID</th>
                <th>รายการ</th>
                <th>📝</th>
                <th>🖼️</th>
                <th>🔗</th>
                <th>ใช้งานล่าสุด</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.user_id}>
                  <td className={styles.userId}>{truncate(user.user_id, 20)}</td>
                  <td>{user.itemCount}</td>
                  <td>{user.textCount}</td>
                  <td>{user.imageCount}</td>
                  <td>{user.linkCount}</td>
                  <td>{formatDate(user.lastActive)}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className={styles.emptyRow}>
                    ไม่พบผู้ใช้งาน
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Items Tab */}
      {activeTab === 'items' && !loading && (
        <div className={styles.itemsSection}>
          {/* Filters */}
          <div className={styles.filters}>
            <input
              type="text"
              placeholder="ค้นหา..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={styles.select}
            >
              <option value="">ทุกประเภท</option>
              <option value="text">ข้อความ</option>
              <option value="image">รูปภาพ</option>
              <option value="link">ลิงก์</option>
            </select>
            <button onClick={fetchItems} className={styles.filterButton}>
              🔍 ค้นหา
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedIds.size > 0 && (
            <div className={styles.bulkActions}>
              <span>เลือก {selectedIds.size} รายการ</span>
              <button onClick={handleDeleteSelected} className={styles.deleteButton}>
                🗑️ ลบที่เลือก
              </button>
            </div>
          )}

          {/* Items Table */}
          <table className={styles.table}>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedIds.size === items.length && items.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(new Set(items.map((i) => i.id)));
                      } else {
                        setSelectedIds(new Set());
                      }
                    }}
                  />
                </th>
                <th>ประเภท</th>
                <th>เนื้อหา</th>
                <th>Tags</th>
                <th>วันที่</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={(e) => {
                        const newSet = new Set(selectedIds);
                        if (e.target.checked) {
                          newSet.add(item.id);
                        } else {
                          newSet.delete(item.id);
                        }
                        setSelectedIds(newSet);
                      }}
                    />
                  </td>
                  <td>
                    {item.type === 'text' && '📝'}
                    {item.type === 'image' && '🖼️'}
                    {item.type === 'link' && '🔗'}
                  </td>
                  <td className={styles.contentCell}>
                    {item.title || truncate(item.content, 50)}
                  </td>
                  <td>
                    {item.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className={styles.miniTag}>
                        #{tag}
                      </span>
                    ))}
                  </td>
                  <td>{formatDate(item.created_at)}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className={styles.emptyRow}>
                    ไม่พบข้อมูล
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
