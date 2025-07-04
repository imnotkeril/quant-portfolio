/**
 * Portfolio Components Main Export
 * Updated with modernized AssetForm and new components
 */

// Core Portfolio Components
export { PortfolioCard } from './PortfolioCard';
export { PortfolioList } from './PortfolioList';
export { PortfolioForm } from './PortfolioForm';
export { AssetTable } from './AssetTable';
export { PortfolioSummary } from './PortfolioSummary';
export { PortfolioFilters } from './PortfolioFilters';
export { PortfolioHeader } from './PortfolioHeader';

// Modernized Asset Management (unified solution)
export { AssetForm } from './AssetForm'; // ✅ Now with Easy/Professional modes + autocomplete
export { default as TemplateSelector } from './TemplateSelector'; // ✅ New template selector
export { default as AssetImport } from './AssetImport'; // ✅ Enhanced import functionality

// Dashboard Components (keep separate for dashboard use)
export { default as QuickAssetForm } from './QuickAssetForm'; // ✅ Keep for Dashboard

// Enhanced Portfolio Creation Components
export { default as PortfolioTemplates } from './PortfolioTemplates/PortfolioTemplates';

// Type Exports
export type { default as PortfolioCardProps } from './PortfolioCard';
export type { default as PortfolioListProps } from './PortfolioList';
export type { default as PortfolioFormProps } from './PortfolioForm';
export type { default as AssetTableProps } from './AssetTable';
export type { default as AssetFormProps } from './AssetForm'; // ✅ Updated with new props
export type { default as PortfolioSummaryProps } from './PortfolioSummary';
export type { default as PortfolioFiltersProps } from './PortfolioFilters';
export type { default as PortfolioHeaderProps } from './PortfolioHeader';
export type { default as TemplateSelectorProps } from './TemplateSelector';
export type { default as AssetImportProps } from './AssetImport';
export type { default as QuickAssetFormProps } from './QuickAssetForm';

