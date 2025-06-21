// src/components/common/Table/Table.tsx
import React, { useState, useMemo, useCallback } from 'react';
import classNames from 'classnames';
import { Pagination } from '../Pagination/Pagination';
import styles from './Table.module.css';

export interface TableColumn<T> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  className?: string;
}

export interface RowSelection<T> {
  selectedRowKeys?: (string | number)[];
  onChange?: (selectedRowKeys: (string | number)[], selectedRows: T[]) => void;
  onSelect?: (record: T, selected: boolean, selectedRows: T[], nativeEvent: Event) => void;
  onSelectAll?: (selected: boolean, selectedRows: T[], changeRows: T[]) => void;
  getCheckboxProps?: (record: T) => { disabled?: boolean; name?: string };
}

export interface Expandable<T> {
  expandedRowKeys?: (string | number)[];
  defaultExpandedRowKeys?: (string | number)[];
  expandedRowRender?: (record: T, index: number, indent: number, expanded: boolean) => React.ReactNode;
  expandRowByClick?: boolean;
  onExpand?: (expanded: boolean, record: T) => void;
  onExpandedRowsChange?: (expandedRows: (string | number)[]) => void;
}

export interface PaginationConfig {
  current?: number;
  pageSize?: number;
  total?: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  onChange?: (page: number, pageSize: number) => void;
  onShowSizeChange?: (current: number, size: number) => void;
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  rowKey: keyof T | ((record: T) => string | number);
  loading?: boolean;
  pagination?: PaginationConfig | false;
  rowSelection?: RowSelection<T>;
  expandable?: Expandable<T>;
  onRowClick?: (record: T, index: number, event: React.MouseEvent<HTMLTableRowElement>) => void;
  onRowDoubleClick?: (record: T, index: number, event: React.MouseEvent<HTMLTableRowElement>) => void;
  className?: string;
  size?: 'small' | 'middle' | 'large';
  bordered?: boolean;
  showHeader?: boolean;
  title?: () => React.ReactNode;
  footer?: () => React.ReactNode;
  scroll?: {
    x?: string | number | true;
    y?: string | number;
  };
  sortDirections?: ('ascend' | 'descend')[];
  defaultSortOrder?: 'ascend' | 'descend';
  emptyText?: React.ReactNode;
}

export function Table<T extends Record<string, any>>({
  data,
  columns,
  rowKey,
  loading = false,
  pagination,
  rowSelection,
  expandable,
  onRowClick,
  onRowDoubleClick,
  className,
  size = 'middle',
  bordered = false,
  showHeader = true,
  title,
  footer,
  scroll,
  emptyText = 'No data',
}: TableProps<T>) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>(
    rowSelection?.selectedRowKeys || []
  );
  const [expandedRowKeys, setExpandedRowKeys] = useState<(string | number)[]>(
    expandable?.expandedRowKeys || expandable?.defaultExpandedRowKeys || []
  );
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [hoveredRowKey, setHoveredRowKey] = useState<string | number | null>(null);

  // Get row key for record
  const getRowKey = useCallback((record: T, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey] || index;
  }, [rowKey]);

  // Handle row selection
  const handleRowSelect = useCallback((record: T, selected: boolean) => {
    const recordKey = getRowKey(record, 0);
    let newSelectedKeys: (string | number)[];

    if (selected) {
      newSelectedKeys = [...selectedRowKeys, recordKey];
    } else {
      newSelectedKeys = selectedRowKeys.filter(key => key !== recordKey);
    }

    setSelectedRowKeys(newSelectedKeys);

    if (rowSelection?.onChange) {
      const selectedRows = data.filter(item =>
        newSelectedKeys.includes(getRowKey(item, 0))
      );
      rowSelection.onChange(newSelectedKeys, selectedRows);
    }

    if (rowSelection?.onSelect) {
      const selectedRows = data.filter(item =>
        newSelectedKeys.includes(getRowKey(item, 0))
      );
      rowSelection.onSelect(record, selected, selectedRows, {} as Event);
    }
  }, [selectedRowKeys, data, getRowKey, rowSelection]);

  // Handle select all
  const handleSelectAll = useCallback((selected: boolean) => {
    let newSelectedKeys: (string | number)[];

    if (selected) {
      newSelectedKeys = data.map((record, index) => getRowKey(record, index));
    } else {
      newSelectedKeys = [];
    }

    setSelectedRowKeys(newSelectedKeys);

    if (rowSelection?.onChange) {
      const selectedRows = selected ? data : [];
      rowSelection.onChange(newSelectedKeys, selectedRows);
    }

    if (rowSelection?.onSelectAll) {
      const selectedRows = selected ? data : [];
      const changeRows = selected ? data : data.filter(item =>
        selectedRowKeys.includes(getRowKey(item, 0))
      );
      rowSelection.onSelectAll(selected, selectedRows, changeRows);
    }
  }, [data, getRowKey, rowSelection, selectedRowKeys]);

  // Handle row expand
  const handleRowExpand = useCallback((record: T, expanded: boolean) => {
    const recordKey = getRowKey(record, 0);
    let newExpandedKeys: (string | number)[];

    if (expanded) {
      newExpandedKeys = [...expandedRowKeys, recordKey];
    } else {
      newExpandedKeys = expandedRowKeys.filter(key => key !== recordKey);
    }

    setExpandedRowKeys(newExpandedKeys);

    if (expandable?.onExpand) {
      expandable.onExpand(expanded, record);
    }

    if (expandable?.onExpandedRowsChange) {
      expandable.onExpandedRowsChange(newExpandedKeys);
    }
  }, [expandedRowKeys, getRowKey, expandable]);

  // Handle column sort
  const handleSort = useCallback((column: TableColumn<T>) => {
    if (!column.sortable) return;

    let newSortOrder: 'ascend' | 'descend' | null = 'ascend';

    if (sortColumn === column.key) {
      if (sortOrder === 'ascend') {
        newSortOrder = 'descend';
      } else if (sortOrder === 'descend') {
        newSortOrder = null;
      }
    }

    setSortColumn(newSortOrder ? column.key : null);
    setSortOrder(newSortOrder);
  }, [sortColumn, sortOrder]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortOrder) return data;

    const column = columns.find(col => col.key === sortColumn);
    if (!column || !column.dataIndex) return data;

    return [...data].sort((a, b) => {
      const aValue = a[column.dataIndex!];
      const bValue = b[column.dataIndex!];

      let result = 0;
      if (aValue < bValue) result = -1;
      if (aValue > bValue) result = 1;

      return sortOrder === 'descend' ? -result : result;
    });
  }, [data, sortColumn, sortOrder, columns]);

  // Check if all rows are selected
  const isAllSelected = data.length > 0 && selectedRowKeys.length === data.length;
  const isIndeterminate = selectedRowKeys.length > 0 && selectedRowKeys.length < data.length;

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <span>Loading...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={styles.empty}>
        {emptyText}
      </div>
    );
  }

  return (
    <div className={classNames(styles.tableContainer, className)}>
      {title && (
        <div className={styles.tableTitle}>
          {title()}
        </div>
      )}

      <div
        className={classNames(styles.tableWrapper, {
          [styles.bordered]: bordered,
        })}
        style={scroll ? { overflowX: 'auto', maxWidth: scroll.x } : undefined}
      >
        <table
          className={classNames(styles.table, styles[size])}
          style={scroll?.y ? { maxHeight: scroll.y } : undefined}
        >
          {showHeader && (
            <thead className={styles.thead}>
              <tr className={styles.headerRow}>
                {rowSelection && (
                  <th className={styles.selectionCell}>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={input => {
                        if (input) input.indeterminate = isIndeterminate;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      aria-label="Select all rows"
                    />
                  </th>
                )}

                {expandable && (
                  <th className={styles.expandCell} aria-label="Expand controls"></th>
                )}

                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={classNames(
                      styles.th,
                      {
                        [styles.sortable]: column.sortable,
                        [styles.sorted]: sortColumn === column.key,
                        [`${styles.align}${column.align || 'left'}`]: true,
                      },
                      column.className
                    )}
                    style={column.width ? { width: column.width } : undefined}
                    onClick={() => column.sortable && handleSort(column)}
                    role={column.sortable ? 'button' : undefined}
                    tabIndex={column.sortable ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (column.sortable && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        handleSort(column);
                      }
                    }}
                    aria-sort={
                      sortColumn === column.key
                        ? sortOrder === 'ascend' ? 'ascending' : 'descending'
                        : column.sortable ? 'none' : undefined
                    }
                  >
                    <div className={styles.headerContent}>
                      <span>{column.title}</span>
                      {column.sortable && (
                        <span className={classNames(styles.sortIcon, {
                          [styles.sortAscend]: sortColumn === column.key && sortOrder === 'ascend',
                          [styles.sortDescend]: sortColumn === column.key && sortOrder === 'descend',
                        })}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="18,15 12,9 6,15" />
                          </svg>
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
          )}

          <tbody className={styles.tbody}>
            {sortedData.map((record, index) => {
              const recordKey = getRowKey(record, index);
              const isSelected = selectedRowKeys.includes(recordKey);
              const isExpanded = expandedRowKeys.includes(recordKey);
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
                    onClick={(e) => {
                      if (expandable?.expandRowByClick) {
                        handleRowExpand(record, !isExpanded);
                      }
                      onRowClick?.(record, index, e);
                    }}
                    onDoubleClick={(e) => onRowDoubleClick?.(record, index, e)}
                    onMouseEnter={() => setHoveredRowKey(recordKey)}
                    onMouseLeave={() => setHoveredRowKey(null)}
                    role={onRowClick ? 'button' : undefined}
                    tabIndex={onRowClick ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        onRowClick(record, index, e as any);
                      }
                    }}
                  >
                    {rowSelection && (
                      <td className={styles.selectionCell}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleRowSelect(record, e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                          {...(rowSelection.getCheckboxProps?.(record) || {})}
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
                          aria-expanded={isExpanded}
                          aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
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
                        {expandable.expandedRowRender(record, index, 0, true)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {footer && (
        <div className={styles.tableFooter}>
          {footer()}
        </div>
      )}

      {pagination && pagination !== false && (
        <div className={styles.pagination}>
          <Pagination
            current={pagination.current || 1}
            pageSize={pagination.pageSize || 10}
            total={pagination.total || data.length}
            showSizeChanger={pagination.showSizeChanger}
            showQuickJumper={pagination.showQuickJumper}
            showTotal={pagination.showTotal}
            onChange={pagination.onChange}
            onShowSizeChange={pagination.onShowSizeChange}
          />
        </div>
      )}
    </div>
  );
}