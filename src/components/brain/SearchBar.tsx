'use client';

import { useState, useCallback } from 'react';
import styles from './brain.module.css';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = 'ค้นหา...' }: SearchBarProps) {
  const [value, setValue] = useState('');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (value.trim()) {
        onSearch(value.trim());
      }
    },
    [value, onSearch]
  );

  const handleClear = useCallback(() => {
    setValue('');
    onSearch('');
  }, [onSearch]);

  return (
    <form className={styles.searchBar} onSubmit={handleSubmit}>
      <span className={styles.searchIcon}>🔍</span>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={styles.searchInput}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className={styles.clearButton}
        >
          ✕
        </button>
      )}
    </form>
  );
}
