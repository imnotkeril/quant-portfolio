/**
 * TemplateSelector Component
 * Simple selector for portfolio templates in AssetForm context
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

  const handleUseTemplate = (template: PortfolioTemplate) => {
    // Calculate total weight to normalize if needed
    const totalWeight = template.assets.reduce((sum, asset) => sum + asset.weight, 0);

    // Convert template assets to AssetCreate format with normalized weights
    const assets: AssetCreate[] = template.assets.map((asset, index) => ({
      ticker: asset.ticker,
      name: asset.name,
      // Normalize weight to ensure total is 100%
      weight: totalWeight > 0 ? (asset.weight / totalWeight) * 100 : 0,
      sector: asset.sector,
      assetClass: asset.assetClass,
      currency: 'USD',
      country: 'United States',
      exchange: 'NASDAQ', // Default exchange
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
                <Badge variant="default" size="small">
                  {showPreview.timeHorizon}
                </Badge>
                <Badge variant="default" size="small">
                  {showPreview.expectedReturn}
                </Badge>
              </div>
            </div>
          </div>

          <div className={styles.previewAssets}>
            <h5>Assets ({showPreview.assets.length} holdings)</h5>
            <div className={styles.assetsList}>
              {showPreview.assets.map((asset, index) => (
                <div key={index} className={styles.previewAsset}>
                  <div className={styles.assetInfo}>
                    <span className={styles.assetTicker}>{asset.ticker}</span>
                    <span className={styles.assetName}>{asset.name}</span>
                  </div>
                  <div className={styles.assetDetails}>
                    <span className={styles.assetWeight}>{asset.weight}%</span>
                    <span className={styles.assetSector}>{asset.sector}</span>
                  </div>
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