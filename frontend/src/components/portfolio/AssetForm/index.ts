/**
 * AssetForm Component Export
 */
export { AssetForm } from './AssetForm';
export { default } from './AssetForm';

// Updated interface with new props for Easy/Professional modes
export interface AssetFormProps {
  asset?: AssetCreate | null;
  onSubmit: (asset: AssetCreate) => void;
  onCancel?: () => void;
  existingTickers?: string[];
  loading?: boolean;
  mode?: 'easy' | 'professional';
  remainingWeight?: number;
  showTemplates?: boolean;
  showImport?: boolean;
  className?: string;
  'data-testid'?: string;
}

export type { AssetFormProps as default };