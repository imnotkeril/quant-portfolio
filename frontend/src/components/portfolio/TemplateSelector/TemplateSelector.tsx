/**
 * TemplateSelector Component - FIXED: Now sends only ticker + weight (like QuickAdd/Import)
 * File: frontend/src/components/portfolio/TemplateSelector/TemplateSelector.tsx
 */
import React, { useState } from 'react';
import classNames from 'classnames';
import { Button } from '../../common/Button/Button';
import { Badge } from '../../common/Badge/Badge';
import { Modal } from '../../common/Modal/Modal';
import { PORTFOLIO_TEMPLATES, PortfolioTemplate } from '../../../constants/portfolioTemplates';
import { AssetCreate } from '../../../types/portfolio';
import styles from './TemplateSelector.module.css';

interface TemplateSelectorProps {
  onTemplateSelect: (assets: AssetCreate[]) => void;
  onCancel?: () => void;
  className?: string;
  'data-testid'?: string;
}

interface AssetFormData {
  id: string;
  ticker: string;
  name: string;
  weight: number;
  sector?: string;
  assetClass?: string;
  currentPrice?: number;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onTemplateSelect,
  onCancel,
  className,
  'data-testid': testId,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<PortfolioTemplate | null>(null);
  const [showPreview, setShowPreview] = useState<PortfolioTemplate | null>(null);

  // ✅ FIXED: Now sends only ticker + weight (like QuickAdd/Import)
  const handleUseTemplate = (template: PortfolioTemplate) => {
    // Calculate total weight to normalize if needed
    const totalWeight = template.assets.reduce((sum, asset) => sum + asset.weight, 0);

    // ✅ FIXED: Send only ticker + weight (like QuickAdd/Import)
    // AssetTable will auto-enrich with company name, sector, and prices
    const assets: AssetCreate[] = template.assets.map((asset) => ({
      ticker: asset.ticker,
      // Normalize weight to ensure total is 100%
      weight: totalWeight > 0 ? (asset.weight / totalWeight) * 100 : 0,
    }));

    onTemplateSelect(assets);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  const containerClasses = classNames(styles.container, className);

  if (showPreview) {
    return (
      <div className={containerClasses} data-testid={testId}>
        <div className={styles.header}>
          <Button
            variant="ghost"
            onClick={() => setShowPreview(null)}
            className={styles.backButton}
          >
            ← Back to Templates
          </Button>
          <h3>{showPreview.name}</h3>
        </div>

        <div className={styles.previewContent}>
          <div className={styles.previewHeader}>
            <div className={styles.previewIcon}>{showPreview.icon}</div>
            <div className={styles.previewInfo}>
              <h4 className={styles.previewTitle}>{showPreview.name}</h4>
              <p className={styles.previewDescription}>{showPreview.description}</p>
              <div className={styles.previewTags}>
                <Badge variant={getRiskColor(showPreview.riskLevel)} size="small">
                  {showPreview.riskLevel} risk
                </Badge>
                {' '}
                <Badge variant="default" size="small">
                  {showPreview.timeHorizon}
                </Badge>
                {' '}
                <Badge variant="default" size="small">
                  {showPreview.expectedReturn}
                </Badge>
              </div>
            </div>
          </div>

          <div className={styles.previewAssets}>
            <h5>Assets ({showPreview.assets.length} holdings)</h5>
            <div className={styles.assetsTable}>
              <div className={styles.tableHeader}>
                <span>Ticker</span>
                <span>Company</span>
                <span>Weight</span>
                <span>Sector</span>
              </div>
              {showPreview.assets.map((asset, index) => (
                <div key={index} className={styles.assetRow}>
                  <span className={styles.assetTicker}>{asset.ticker}</span>
                  <span className={styles.assetName}>{asset.name}</span>
                  <span className={styles.assetWeight}>{asset.weight}%</span>
                  <span className={styles.assetSector}>{asset.sector}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.previewActions}>
            <Button
              variant="secondary"
              onClick={() => setShowPreview(null)}
            >
              Back
            </Button>
            <Button
              variant="primary"
              onClick={() => handleUseTemplate(showPreview)}
            >
              Use This Template
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses} data-testid={testId}>
      <div className={styles.header}>
        <h3>Choose a Template</h3>
        <p>Start with a pre-built portfolio strategy</p>
      </div>

      <div className={styles.templatesGrid}>
        {PORTFOLIO_TEMPLATES.map(template => (
          <div
            key={template.id}
            className={classNames(styles.templateCard, {
              [styles.selected]: selectedTemplate?.id === template.id
            })}
            onClick={() => setSelectedTemplate(template)}
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>{template.icon}</div>
              <div className={styles.cardInfo}>
                <h4 className={styles.cardTitle}>{template.name}</h4>
                <p className={styles.cardDescription}>{template.description}</p>
              </div>
            </div>

            <div className={styles.cardStats}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Risk</span>
                <Badge variant={getRiskColor(template.riskLevel)} size="small">
                  {template.riskLevel}
                </Badge>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Return</span>
                <span className={styles.statValue}>{template.expectedReturn}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Timeline</span>
                <span className={styles.statValue}>{template.timeHorizon}</span>
              </div>
            </div>

            <div className={styles.cardAssets}>
              <div className={styles.topAssets}>
                {template.assets.slice(0, 3).map((asset, index) => (
                  <div key={index} className={styles.topAsset}>
                    <span className={styles.topAssetTicker}>{asset.ticker}</span>
                    <span className={styles.topAssetWeight}>{asset.weight}%</span>
                  </div>
                ))}
                {template.assets.length > 3 && (
                  <div className={styles.moreAssets}>
                    +{template.assets.length - 3} more
                  </div>
                )}
              </div>
            </div>

            <div className={styles.cardActions}>
              <Button
                variant="ghost"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPreview(template);
                }}
              >
                Preview
              </Button>
              <Button
                variant="primary"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUseTemplate(template);
                }}
              >
                Use Template
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footerActions}>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Skip Templates
          </Button>
        )}
        <Button variant="secondary" onClick={onCancel}>
          Manual Setup
        </Button>
      </div>
    </div>
  );
};

export default TemplateSelector;