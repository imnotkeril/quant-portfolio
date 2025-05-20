import React, { useState } from 'react';
import classNames from 'classnames';

export interface TableColumn<T> {
  key: string;
  title: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  rowKey: keyof T | ((record: T) => string);
  loading?: boolean;
  pagination?: {
    pageSize: number;
    current: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  onSort?: (key: string, order: 'asc' | 'desc') => void;
  sortedColumn?: { key: string; order: 'asc' | 'desc' };
  onRowClick?: (record: T, index: number) => void;
  emptyText?: string;
  className?: string;
  compact?: boolean;
  striped?: boolean;
  bordered?: boolean;
}

/**
 * Table component following Wild Market Capital design system
 */
export function Table<T>({
  data,
  columns,
  rowKey,
  loading = false,
  pagination,
  onSort,
  sortedColumn,
  onRowClick,
  emptyText = 'No data available',
  className,
  compact = false,
  striped = true,
  bordered = false
}: TableProps<T>) {
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null);

  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return String(record[rowKey]);
  };

  const handleSort = (column: TableColumn<T>) => {
    if (!column.sortable || !onSort) return;

    const key = column.key;
    const newOrder = sortedColumn?.key === key && sortedColumn?.order === 'asc' ? 'desc' : 'asc';

    onSort(key, newOrder);
  };

  const getSortIcon = (column: TableColumn<T>) => {
    if (!column.sortable) return null;

    const isActive = sortedColumn?.key === column.key;
    const isAsc = isActive && sortedColumn?.order === 'asc';
    const isDesc = isActive && sortedColumn?.order === 'desc';

    return (
      <div className={classNames(
        'ml-1 transition-all',
        {
          'text-accent': isActive,
          'text-neutral-gray': !isActive
        }
      )}>
        {isAsc ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        ) : isDesc ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <polyline points="19 12 12 19 5 12"></polyline>
          </svg>
        )}
      </div>
    );
  };

  // Calculate display data based on pagination
  const getDisplayData = () => {
    if (!pagination) return data;

    const { current, pageSize } = pagination;
    const startIndex = (current - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return data.slice(startIndex, endIndex);
  };

  // Render pagination component
  const renderPagination = () => {
    if (!pagination) return null;

    const { current, pageSize, total, onChange } = pagination;
    const totalPages = Math.ceil(total / pageSize);

    if (totalPages <= 1) return null;

    const pageButtons = [];
    const maxButtons = 5;
    let startPage = Math.max(1, current - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    // Previous button
    pageButtons.push(
      <button
        key="prev"
        className={classNames(
          'px-3 py-1 rounded-md transition-colors',
          {
            'text-neutral-gray cursor-not-allowed': current === 1,
            'text-white hover:bg-divider': current !== 1
          }
        )}
        onClick={() => current > 1 && onChange(current - 1, pageSize)}
        disabled={current === 1}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
    );

    // First page button if needed
    if (startPage > 1) {
      pageButtons.push(
        <button
          key="1"
          className="px-3 py-1 rounded-md text-white hover:bg-divider transition-colors"
          onClick={() => onChange(1, pageSize)}
        >
          1
        </button>
      );

      if (startPage > 2) {
        pageButtons.push(
          <span key="ellipsis1" className="px-3 py-1 text-neutral-gray">...</span>
        );
      }
    }

    // Page buttons
    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(
        <button
          key={i}
          className={classNames(
            'px-3 py-1 rounded-md transition-colors',
            {
              'bg-accent text-white': i === current,
              'text-white hover:bg-divider': i !== current
            }
          )}
          onClick={() => onChange(i, pageSize)}
        >
          {i}
        </button>
      );
    }

    // Last page button if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageButtons.push(
          <span key="ellipsis2" className="px-3 py-1 text-neutral-gray">...</span>
        );
      }

      pageButtons.push(
        <button
          key={totalPages}
          className="px-3 py-1 rounded-md text-white hover:bg-divider transition-colors"
          onClick={() => onChange(totalPages, pageSize)}
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    pageButtons.push(
      <button
        key="next"
        className={classNames(
          'px-3 py-1 rounded-md transition-colors',
          {
            'text-neutral-gray cursor-not-allowed': current === totalPages,
            'text-white hover:bg-divider': current !== totalPages
          }
        )}
        onClick={() => current < totalPages && onChange(current + 1, pageSize)}
        disabled={current === totalPages}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    );

    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-neutral-gray">
          Showing {(current - 1) * pageSize + 1} to {Math.min(current * pageSize, total)} of {total} entries
        </div>
        <div className="flex space-x-1">
          {pageButtons}
        </div>
      </div>
    );
  };

  const displayData = getDisplayData();

  return (
    <div className={classNames('w-full', className)}>
      <div className="w-full overflow-x-auto">
        <table className={classNames(
          'w-full',
          {
            'border-collapse': bordered,
            'border-separate border-spacing-0': !bordered
          }
        )}>
          <thead className="bg-background/50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={classNames(
                    'transition-colors',
                    {
                      'py-3 px-4': !compact,
                      'py-2 px-3': compact,
                      'text-left': column.align === 'left' || !column.align,
                      'text-center': column.align === 'center',
                      'text-right': column.align === 'right',
                      'border-b border-divider': !bordered,
                      'border border-divider': bordered,
                      'cursor-pointer hover:bg-divider': column.sortable,
                    }
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column)}
                >
                  <div className="flex items-center font-semibold text-sm text-white">
                    <span>{column.title}</span>
                    {getSortIcon(column)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className={classNames(
                    'text-center',
                    {
                      'py-4': !compact,
                      'py-3': compact,
                      'border border-divider': bordered
                    }
                  )}
                >
                  <div className="flex items-center justify-center text-neutral-gray">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </div>
                </td>
              </tr>
            ) : displayData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className={classNames(
                    'text-center text-neutral-gray',
                    {
                      'py-4': !compact,
                      'py-3': compact,
                      'border border-divider': bordered
                    }
                  )}
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              displayData.map((record, index) => (
                <tr
                  key={getRowKey(record, index)}
                  className={classNames(
                    'transition-colors',
                    {
                      'bg-background/30': striped && index % 2 === 0,
                      'bg-background/10': striped && index % 2 !== 0,
                      'bg-divider/20': hoveredRowIndex === index,
                      'cursor-pointer': !!onRowClick
                    }
                  )}
                  onClick={() => onRowClick && onRowClick(record, index)}
                  onMouseEnter={() => setHoveredRowIndex(index)}
                  onMouseLeave={() => setHoveredRowIndex(null)}
                >
                  {columns.map((column) => (
                    <td
                      key={`${getRowKey(record, index)}-${column.key}`}
                      className={classNames(
                        {
                          'py-3 px-4': !compact,
                          'py-2 px-3': compact,
                          'text-left': column.align === 'left' || !column.align,
                          'text-center': column.align === 'center',
                          'text-right': column.align === 'right',
                          'border-b border-divider': !bordered,
                          'border border-divider': bordered,
                        }
                      )}
                    >
                      {column.render
                        ? column.render(record[column.key as keyof T], record, index)
                        : record[column.key as keyof T]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {renderPagination()}
    </div>
  );
}