/**
 * Table Component
 * Universal data table with sorting, filtering, and pagination
 */
import React, { useState, useMemo } from 'react';
import classNames from 'classnames';
import styles from './Table.module.css';

export type TableColumnAlign = 'left' | 'center' | 'right';
export type TableSortDirection = 'asc' | 'desc';

export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: string | number;
  minWidth?: string | number;
  align?: TableColumnAlign;
  sortable?: boolean;
  filterable?: boolean;
  fixed?: 'left' | 'right';
  className?: string;
}

export interface TableSortState {
  key: string;
  direction: TableSortDirection;
}

export interface TablePaginationConfig {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  onChange?: (page: number, pageSize: number) => void;
  onShowSizeChange?: (current: number, size: number) => void;
}

interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: keyof T | ((record: T, index: number) => string);
  loading?: boolean;
  pagination?: TablePaginationConfig | false;
  sortState?: TableSortState;
  onSort?: (key: string, direction: TableSortDirection) => void;
  onRowClick?: (record: T, index: number, event: React.MouseEvent) => void;
  onRowDoubleClick?: (record: T, index: number, event: React.MouseEvent) => void;
  rowSelection?: {
    selectedRowKeys?: string[];
    onChange?: (selectedRowKeys: string[], selectedRows: T[]) => void;
    onSelect?: (record: T, selected: boolean, selectedRows: T[]) => void;
    onSelectAll?: (selected: boolean, selectedRows: T[], changeRows: T[]) => void;
  };
  expandable?: {
    expandedRowKeys?: string[];
    onExpand?: (expanded: boolean, record: T) => void;
    expandedRowRender?: (record: T, index: number) => React.ReactNode;
  };
  scroll?: {
    x?: string | number;
    y?: string | number;
  };
  size?: 'small' | 'middle' | 'large';
  bordered?: boolean;
  showHeader?: boolean;
  sticky?: boolean;
  emptyText?: React.ReactNode;
  className?: string;
  'data-testid'?: string;
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  rowKey,
  loading = false,
  pagination,
  sortState,
  onSort,
  onRowClick,
  onRowDoubleClick,
  rowSelection,
  expandable,
  scroll,
  size = 'middle',
  bordered = false,
  showHeader = true,
  sticky = false,
  emptyText = 'No data',
  className,
  'data-testid': testId,
}: TableProps<T>) {
  const [hoveredRowKey, setHoveredRowKey] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pagination ? pagination.pageSize : 10);

  // Get row key
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record, index);
    }
    return String(record[rowKey]);
  };

  // Handle sorting
  const handleSort = (column: TableColumn<T>) => {
    if (!column.sortable || !onSort) return;

    const key = column.key;
    let direction: TableSortDirection = 'asc';

    if (sortState?.key === key) {
      direction = sortState.direction === 'asc' ? 'desc' : 'asc';
    }

    onSort(key, direction);
  };

  // Handle row selection
  const handleRowSelect = (record: T, selected: boolean) => {
    if (!rowSelection?.onChange) return;

    const recordKey = getRowKey(record, 0);
    const currentSelectedKeys = rowSelection.selectedRowKeys || [];

    let newSelectedKeys: string[];
    if (selected) {
      newSelectedKeys = [...currentSelectedKeys, recordKey];
    } else {
      newSelectedKeys = currentSelectedKeys.filter(key => key !== recordKey);
    }

    const selectedRows = data.filter((item, index) =>
      newSelectedKeys.includes(getRowKey(item, index))
    );

    rowSelection.onChange(newSelectedKeys, selectedRows);
    rowSelection.onSelect?.(record, selected, selectedRows);
  };

  // Handle select all
  const handleSelectAll = (selected: boolean) => {
    if (!rowSelection?.onChange) return;

    const allRowKeys = data.map((record, index) => getRowKey(record, index));
    const newSelectedKeys = selected ? allRowKeys : [];
    const selectedRows = selected ? data : [];

    rowSelection.onChange(newSelectedKeys, selectedRows);
    rowSelection.onSelectAll?.(selected, selectedRows, data);
  };

  // Handle row expansion
  const handleRowExpand = (record: T, expanded: boolean) => {
    expandable?.onExpand?.(expanded, record);
  };

  // Calculate pagination
  const paginationConfig = useMemo(() => {
    if (!pagination) return null;

    const current = pagination.current || currentPage;
    const size = pagination.pageSize || pageSize;
    const total = pagination.total || data.length;

    return {
      current,
      pageSize: size,
      total,
      showSizeChanger: pagination.showSizeChanger,
      showQuickJumper: pagination.showQuickJumper,
      showTotal: pagination.showTotal,
    };
  }, [pagination, currentPage, pageSize, data.length]);

  // Get display data (with pagination if enabled)
  const displayData = useMemo(() => {
    if (!paginationConfig) return data;

    const { current, pageSize: size } = paginationConfig;
    const start = (current - 1) * size;
    const end = start + size;

    return data.slice(start, end);
  }, [data, paginationConfig]);

  // Handle pagination change
  const handlePaginationChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
    pagination?.onChange?.(page, size);
  };

  // Check if all rows are selected
  const isAllSelected = useMemo(() => {
    if (!rowSelection?.selectedRowKeys || data.length === 0) return false;
    return data.every((record, index) =>
      rowSelection.selectedRowKeys!.includes(getRowKey(record, index))
    );
  }, [rowSelection?.selectedRowKeys, data, getRowKey]);

  // Check if some rows are selected (for indeterminate state)
  const isSomeSelected = useMemo(() => {
    if (!rowSelection?.selectedRowKeys || data.length === 0) return false;
    const selectedCount = data.filter((record, index) =>
      rowSelection.selectedRowKeys!.includes(getRowKey(record, index))
    ).length;
    return selectedCount > 0 && selectedCount < data.length;
  }, [rowSelection?.selectedRowKeys, data, getRowKey]);

  const tableClasses = classNames(
    styles.table,
    styles[size],
    {
      [styles.bordered]: bordered,
      [styles.sticky]: sticky,
    },
    className
  );

  const containerClasses = classNames(
    styles.container,
    {
      [styles.loading]: loading,
    }
  );

  if (loading) {
    return (
      <div className={containerClasses} data-testid={testId}>
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner} />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses} data-testid={testId}>
      <div
        className={styles.tableWrapper}
        style={{
          overflowX: scroll?.x ? 'auto' : undefined,
          overflowY: scroll?.y ? 'auto' : undefined,
          maxHeight: scroll?.y,
        }}
      >
        <table
          className={tableClasses}
          style={{ minWidth: scroll?.x }}
        >
          {showHeader && (
            <thead className={styles.thead}>
              <tr>
                {rowSelection && (
                  <th className={styles.selectionColumn}>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={input => {
                        if (input) input.indeterminate = isSomeSelected;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                )}

                {expandable && (
                  <th className={styles.expandColumn} />
                )}

                {columns.map((column) => {
                  const isSorted = sortState?.key === column.key;
                  const sortDirection = isSorted ? sortState.direction : undefined;

                  return (
                    <th
                      key={column.key}
                      className={classNames(
                        styles.th,
                        {
                          [styles.sortable]: column.sortable,
                          [styles.sorted]: isSorted,
                          [`${styles.align}${column.align || 'left'}`]: true,
                        },
                        column.className
                      )}
                      style={{
                        width: column.width,
                        minWidth: column.minWidth,
                      }}
                      onClick={() => handleSort(column)}
                    >
                      <div className={styles.headerContent}>
                        <span className={styles.headerText}>{column.title}</span>
                        {column.sortable && (
                          <span className={classNames(
                            styles.sortIcon,
                            {
                              [styles.sortAsc]: sortDirection === 'asc',
                              [styles.sortDesc]: sortDirection === 'desc',
                            }
                          )}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="6,15 12,9 18,15" />
                            </svg>
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
          )}

          <tbody className={styles.tbody}>
            {displayData.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (rowSelection ? 1 : 0) +
                    (expandable ? 1 : 0)
                  }
                  className={styles.emptyCell}
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              displayData.map((record, index) => {
                const recordKey = getRowKey(record, index);
                const isSelected = rowSelection?.selectedRowKeys?.includes(recordKey) || false;
                const isExpanded = expandable?.expandedRowKeys?.includes(recordKey) || false;
                const isHovered = hoveredRowKey === recordKey;

                return (
                  <React.Fragment key={recordKey}>
                    <tr
                      className={classNames(
                        styles.tr,
                        {
                          [styles.selected]: isSelected,
                          [styles.hovered]: isHovered,
                          [styles.clickable]: !!onRowClick,
                        }
                      )}
                      onClick={(e) => onRowClick?.(record, index, e)}
                      onDoubleClick={(e) => onRowDoubleClick?.(record, index, e)}
                      onMouseEnter={() => setHoveredRowKey(recordKey)}
                      onMouseLeave={() => setHoveredRowKey(null)}
                    >
                      {rowSelection && (
                        <td className={styles.selectionCell}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleRowSelect(record, e.target.checked)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                      )}

                      {expandable && (
                        <td className={styles.expandCell}>
                          <button
                            type="button"
                            className={classNames(
                              styles.expandButton,
                              { [styles.expanded]: isExpanded }
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowExpand(record, !isExpanded);
                            }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="9,18 15,12 9,6" />
                            </svg>
                          </button>
                        </td>
                      )}

                      {columns.map((column) => {
                        const value = column.dataIndex ? record[column.dataIndex] : undefined;
                        const cellContent = column.render
                          ? column.render(value, record, index)
                          : value;

                        return (
                          <td
                            key={column.key}
                            className={classNames(
                              styles.td,
                              {
                                [`${styles.align}${column.align || 'left'}`]: true,
                              },
                              column.className
                            )}
                          >
                            {cellContent}
                          </td>
                        );
                      })}
                    </tr>

                    {expandable?.expandedRowRender && isExpanded && (
                      <tr className={styles.expandedRow}>
                        <td
                          colSpan={
                            columns.length +
                            (rowSelection ? 1 : 0) +
                            (expandable ? 1 : 0)
                          }
                          className={styles.expandedCell}
                        >
                          {expandable.expandedRowRender(record, index)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {paginationConfig && paginationConfig.total > 0 && (
        <div className={styles.pagination}>
          <TablePagination
            {...paginationConfig}
            onChange={handlePaginationChange}
            onShowSizeChange={(current, size) => {
              setPageSize(size);
              pagination?.onShowSizeChange?.(current, size);
            }}
          />
        </div>
      )}
    </div>
  );
}

// Simple pagination component for the table
const TablePagination: React.FC<{
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  onChange: (page: number, size: number) => void;
  onShowSizeChange?: (current: number, size: number) => void;
}> = ({
  current,
  pageSize,
  total,
  showSizeChanger,
  showTotal,
  onChange,
  onShowSizeChange,
}) => {
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (current - 1) * pageSize + 1;
  const endIndex = Math.min(current * pageSize, total);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onChange(page, pageSize);
    }
  };

  const handleSizeChange = (newSize: number) => {
    const newPage = Math.ceil((startIndex - 1) / newSize) + 1;
    onChange(newPage, newSize);
    onShowSizeChange?.(newPage, newSize);
  };

  return (
    <div className={styles.paginationContainer}>
      {showTotal && (
        <div className={styles.paginationTotal}>
          {showTotal(total, [startIndex, endIndex])}
        </div>
      )}

      <div className={styles.paginationControls}>
        <button
          className={styles.pageButton}
          disabled={current <= 1}
          onClick={() => handlePageChange(current - 1)}
        >
          Previous
        </button>

        <span className={styles.pageInfo}>
          {current} / {totalPages}
        </span>

        <button
          className={styles.pageButton}
          disabled={current >= totalPages}
          onClick={() => handlePageChange(current + 1)}
        >
          Next
        </button>
      </div>

      {showSizeChanger && (
        <div className={styles.sizeChanger}>
          <select
            value={pageSize}
            onChange={(e) => handleSizeChange(Number(e.target.value))}
            className={styles.sizeSelect}
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default Table;