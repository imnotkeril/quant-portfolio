// src/components/common/index.ts - UPDATED VERSION
/**
 * Common UI Components Export Index
 * All reusable UI components for the Investment Portfolio Management System
 */

// Button
export { Button } from './Button/Button';
export type { ButtonVariant, ButtonSize } from './Button/Button';

// Input
export { Input } from './Input/Input';

// Select
export { Select } from './Select/Select';
export type { SelectOption } from './Select/Select';

// Table
export { Table } from './Table/Table';
export type {
  TableColumn,
  RowSelection,
  Expandable,
  PaginationConfig
} from './Table/Table';

// Pagination
export { Pagination } from './Pagination/Pagination';

// Modal
export { Modal } from './Modal/Modal';

// Card
export { Card } from './Card/Card';

// Dropdown
export { Dropdown } from './Dropdown/Dropdown';
export type { DropdownMenuItem } from './Dropdown/Dropdown';

// Alert
export { Alert } from './Alert/Alert';
export type { AlertType } from './Alert/Alert';

// Loader
export { Loader } from './Loader/Loader';
export type { LoaderSize, LoaderType } from './Loader/Loader';

// Badge
export { Badge } from './Badge/Badge';
export type { BadgeStatus, BadgeSize } from './Badge/Badge';

// Tooltip
export { Tooltip } from './Tooltip/Tooltip';
export type { TooltipPlacement, TooltipTrigger } from './Tooltip/Tooltip';

// Tabs (will be implemented)
// export { Tabs } from './Tabs/Tabs';

// Default exports for compatibility
export { default as ButtonDefault } from './Button/Button';
export { default as InputDefault } from './Input/Input';
export { default as SelectDefault } from './Select/Select';
export { default as TableDefault } from './Table/Table';
export { default as PaginationDefault } from './Pagination/Pagination';
export { default as ModalDefault } from './Modal/Modal';
export { default as CardDefault } from './Card/Card';
export { default as DropdownDefault } from './Dropdown/Dropdown';
export { default as AlertDefault } from './Alert/Alert';
export { default as LoaderDefault } from './Loader/Loader';
export { default as BadgeDefault } from './Badge/Badge';
export { default as TooltipDefault } from './Tooltip/Tooltip';