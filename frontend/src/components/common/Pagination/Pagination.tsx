// src/components/common/Pagination/Pagination.tsx
import React, { useMemo, useCallback } from 'react';
import classNames from 'classnames';
import { Select } from '../Select/Select';
import styles from './Pagination.module.css';

interface PaginationProps {
  current: number;
  total: number;
  pageSize: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  onChange?: (page: number, pageSize: number) => void;
  onShowSizeChange?: (current: number, size: number) => void;
  className?: string;
  size?: 'small' | 'default';
  disabled?: boolean;
  hideOnSinglePage?: boolean;
  pageSizeOptions?: string[];
  showLessItems?: boolean;
}

const defaultPageSizeOptions = ['10', '20', '50', '100'];

export const Pagination: React.FC<PaginationProps> = ({
  current,
  total,
  pageSize,
  showSizeChanger = false,
  showQuickJumper = false,
  showTotal,
  onChange,
  onShowSizeChange,
  className,
  size = 'default',
  disabled = false,
  hideOnSinglePage = false,
  pageSizeOptions = defaultPageSizeOptions,
  showLessItems = false,
}) => {
  const totalPages = useMemo(() => Math.ceil(total / pageSize), [total, pageSize]);

  const startIndex = useMemo(() => (current - 1) * pageSize + 1, [current, pageSize]);
  const endIndex = useMemo(() => Math.min(current * pageSize, total), [current, pageSize, total]);

  // Generate page numbers to show
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    const maxVisible = showLessItems ? 5 : 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const half = Math.floor(maxVisible / 2);
      let start = Math.max(1, current - half);
      let end = Math.min(totalPages, start + maxVisible - 1);

      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }

      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push('...');
        }
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }

    return pages;
  }, [current, totalPages, showLessItems]);

  const handlePageChange = useCallback((page: number) => {
    if (page < 1 || page > totalPages || page === current || disabled) {
      return;
    }
    onChange?.(page, pageSize);
  }, [current, totalPages, pageSize, onChange, disabled]);

  const handleSizeChange = useCallback((size: string) => {
    const newSize = parseInt(size, 10);
    if (newSize !== pageSize && !disabled) {
      onShowSizeChange?.(current, newSize);
    }
  }, [current, pageSize, onShowSizeChange, disabled]);

  const handleQuickJump = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLInputElement;
      const page = parseInt(target.value, 10);
      if (page && page >= 1 && page <= totalPages) {
        handlePageChange(page);
        target.value = '';
      }
    }
  }, [handlePageChange, totalPages]);

  // Hide if only one page and hideOnSinglePage is true
  if (hideOnSinglePage && totalPages <= 1) {
    return null;
  }

  return (
    <div className={classNames(styles.pagination, styles[size], className)}>
      {showTotal && (
        <div className={styles.total}>
          {showTotal(total, [startIndex, endIndex])}
        </div>
      )}

      <div className={styles.paginationControls}>
        {/* Previous button */}
        <button
          type="button"
          className={classNames(styles.pageButton, styles.prevButton, {
            [styles.disabled]: current <= 1 || disabled,
          })}
          onClick={() => handlePageChange(current - 1)}
          disabled={current <= 1 || disabled}
          aria-label="Previous page"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15,18 9,12 15,6" />
          </svg>
        </button>

        {/* Page numbers */}
        <div className={styles.pageNumbers}>
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className={styles.ellipsis}>
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            return (
              <button
                key={pageNum}
                type="button"
                className={classNames(styles.pageButton, {
                  [styles.active]: pageNum === current,
                  [styles.disabled]: disabled,
                })}
                onClick={() => handlePageChange(pageNum)}
                disabled={disabled}
                aria-label={`Page ${pageNum}`}
                aria-current={pageNum === current ? 'page' : undefined}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <button
          type="button"
          className={classNames(styles.pageButton, styles.nextButton, {
            [styles.disabled]: current >= totalPages || disabled,
          })}
          onClick={() => handlePageChange(current + 1)}
          disabled={current >= totalPages || disabled}
          aria-label="Next page"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9,18 15,12 9,6" />
          </svg>
        </button>
      </div>

      {/* Page size changer */}
      {showSizeChanger && (
        <div className={styles.sizeChanger}>
          <span className={styles.sizeLabel}>Show</span>
          <Select
            value={pageSize.toString()}
            onChange={handleSizeChange}
            disabled={disabled}
            size={size}
            className={styles.sizeSelect}
            options={pageSizeOptions.map(option => ({
              value: option,
              label: option,
            }))}
          />
          <span className={styles.sizeLabel}>per page</span>
        </div>
      )}

      {/* Quick jumper */}
      {showQuickJumper && (
        <div className={styles.quickJumper}>
          <span className={styles.jumperLabel}>Go to</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            className={styles.jumperInput}
            onKeyDown={handleQuickJump}
            disabled={disabled}
            placeholder="Page"
            aria-label="Go to page"
          />
        </div>
      )}
    </div>
  );
};