/**
 * Pagination Component
 * Navigate through pages of content with various display options
 */
import React from 'react';
import classNames from 'classnames';
import styles from './Pagination.module.css';

export type PaginationSize = 'small' | 'default' | 'large';

interface PaginationProps {
  current?: number;
  total: number;
  pageSize?: number;
  size?: PaginationSize;
  disabled?: boolean;
  hideOnSinglePage?: boolean;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  showLessItems?: boolean;
  simple?: boolean;
  responsive?: boolean;
  onChange?: (page: number, pageSize: number) => void;
  onShowSizeChange?: (current: number, size: number) => void;
  pageSizeOptions?: string[];
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  current = 1,
  total,
  pageSize = 10,
  size = 'default',
  disabled = false,
  hideOnSinglePage = false,
  showSizeChanger = false,
  showQuickJumper = false,
  showTotal,
  showLessItems = false,
  simple = false,
  responsive = false,
  onChange,
  onShowSizeChange,
  pageSizeOptions = ['10', '20', '50', '100'],
  className,
  style,
  'data-testid': testId,
}) => {
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (current - 1) * pageSize + 1;
  const endIndex = Math.min(current * pageSize, total);

  // Don't render if should hide on single page
  if (hideOnSinglePage && totalPages <= 1) {
    return null;
  }

  const handlePageChange = (page: number) => {
    if (disabled || page === current || page < 1 || page > totalPages) {
      return;
    }
    onChange?.(page, pageSize);
  };

  const handleSizeChange = (newSize: number) => {
    if (disabled) return;

    const newTotalPages = Math.ceil(total / newSize);
    let newPage = current;

    // Adjust current page if it exceeds new total pages
    if (current > newTotalPages) {
      newPage = newTotalPages;
    }

    onChange?.(newPage, newSize);
    onShowSizeChange?.(newPage, newSize);
  };

  const handleQuickJump = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const target = event.target as HTMLInputElement;
      const page = parseInt(target.value, 10);

      if (!isNaN(page)) {
        handlePageChange(Math.max(1, Math.min(page, totalPages)));
        target.value = '';
      }
    }
  };

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisible = showLessItems ? 5 : 7;

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      let startPage = Math.max(2, current - 2);
      let endPage = Math.min(totalPages - 1, current + 2);

      // Adjust range to show more pages around current
      if (current <= 3) {
        endPage = Math.min(totalPages - 1, 5);
      } else if (current >= totalPages - 2) {
        startPage = Math.max(2, totalPages - 4);
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push('...');
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const renderSimplePagination = () => (
    <div className={styles.simple}>
      <button
        className={styles.prevButton}
        onClick={() => handlePageChange(current - 1)}
        disabled={disabled || current <= 1}
        aria-label="Previous page"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15,18 9,12 15,6" />
        </svg>
      </button>

      <span className={styles.pageInfo}>
        {current} / {totalPages}
      </span>

      <button
        className={styles.nextButton}
        onClick={() => handlePageChange(current + 1)}
        disabled={disabled || current >= totalPages}
        aria-label="Next page"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9,18 15,12 9,6" />
        </svg>
      </button>
    </div>
  );

  const renderPageNumbers = () => {
    const pages = getPageNumbers();

    return pages.map((page, index) => {
      if (page === '...') {
        return (
          <span key={`ellipsis-${index}`} className={styles.ellipsis}>
            •••
          </span>
        );
      }

      const pageNumber = page as number;
      const isActive = pageNumber === current;

      return (
        <button
          key={pageNumber}
          className={classNames(styles.pageButton, {
            [styles.active]: isActive,
          })}
          onClick={() => handlePageChange(pageNumber)}
          disabled={disabled}
          aria-label={`Go to page ${pageNumber}`}
          aria-current={isActive ? 'page' : undefined}
        >
          {pageNumber}
        </button>
      );
    });
  };

  const paginationClasses = classNames(
    styles.pagination,
    styles[size],
    {
      [styles.disabled]: disabled,
      [styles.simple]: simple,
      [styles.responsive]: responsive,
    },
    className
  );

  return (
    <div className={paginationClasses} style={style} data-testid={testId}>
      {showTotal && (
        <div className={styles.total}>
          {showTotal(total, [startIndex, endIndex])}
        </div>
      )}

      {simple ? renderSimplePagination() : (
        <div className={styles.pages}>
          <button
            className={styles.prevButton}
            onClick={() => handlePageChange(current - 1)}
            disabled={disabled || current <= 1}
            aria-label="Previous page"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6" />
            </svg>
            <span className={styles.prevText}>Previous</span>
          </button>

          {renderPageNumbers()}

          <button
            className={styles.nextButton}
            onClick={() => handlePageChange(current + 1)}
            disabled={disabled || current >= totalPages}
            aria-label="Next page"
          >
            <span className={styles.nextText}>Next</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9,18 15,12 9,6" />
            </svg>
          </button>
        </div>
      )}

      {showSizeChanger && (
        <div className={styles.sizeChanger}>
          <select
            value={pageSize}
            onChange={(e) => handleSizeChange(Number(e.target.value))}
            className={styles.sizeSelect}
            disabled={disabled}
          >
            {pageSizeOptions.map(option => (
              <option key={option} value={option}>
                {option} / page
              </option>
            ))}
          </select>
        </div>
      )}

      {showQuickJumper && (
        <div className={styles.quickJumper}>
          <span>Go to</span>
          <input
            type="number"
            className={styles.jumpInput}
            min={1}
            max={totalPages}
            onKeyDown={handleQuickJump}
            disabled={disabled}
            placeholder="Page"
          />
        </div>
      )}
    </div>
  );
};

export default Pagination;