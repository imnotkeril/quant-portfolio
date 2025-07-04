/**
 * TemplateSelector Component Export
 */
export { TemplateSelector } from './TemplateSelector';
export { default } from './TemplateSelector';

export interface TemplateSelectorProps {
  onTemplateSelect: (assets: AssetCreate[]) => void;
  onCancel?: () => void;
  className?: string;
  'data-testid'?: string;
}

export type { TemplateSelectorProps as default };