/**
 * PortfolioTemplates Component
 * Display and select portfolio templates
 */
import React, { useState } from 'react';
import classNames from 'classnames';
import Card from '../../common/Card/Card';
import { Button } from '../../common/Button/Button';
import { Badge } from '../../common/Badge/Badge';
import { Modal } from '../../common/Modal/Modal';
import {
  PORTFOLIO_TEMPLATES,
  PortfolioTemplate,
  templateToFormData,
  getTemplatesByRiskLevel
} from '../../../constants/portfolioTemplates';
import { formatPercentage } from '../../../utils/formatters';
import styles from './PortfolioTemplates.module.css';

interface PortfolioTemplatesProps {
  onSelectTemplate: (templateData: any) => void;
  onCancel?: () => void;
  initialCash?: number;
  className?: string;
  showAsModal?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export const PortfolioTemplates: React.FC<PortfolioTemplatesProps> = ({
  onSelectTemplate,
  onCancel,
  initialCash = 100000,
  className,
  showAsModal = false,
  isOpen = true,
  onClose
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<PortfolioTemplate | null>(null);
  const [filterRisk, setFilterRisk] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [showPreview, setShowPreview] = useState<PortfolioTemplate | null>(null);

  const filteredTemplates = filterRisk === 'all'
    ? PORTFOLIO_TEMPLATES
    : getTemplatesByRiskLevel(filterRisk);

  const handleSelectTemplate = (template: PortfolioTemplate) => {
    const formData = templateToFormData(template, initialCash);
    onSelectTemplate(formData);
  };

  const handlePreviewTemplate = (template: PortfolioTemplate) => {
    setShowPreview(template);
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  const TemplateCard = ({ template }: { template: PortfolioTemplate }) => (
    <Card className={styles.templateCard}>
      <div className={styles.templateHeader}>
        <div className={styles.templateIcon}>{template.icon}</div>
        <div className={styles.templateInfo}>
          <h3 className={styles.templateName}>{template.name}</h3>
          <p className={styles.templateDescription}>{template.description}</p>
        </div>
        <Badge
          color={getRiskLevelColor(template.riskLevel)}
          className={styles.riskBadge}
        >
          {template.riskLevel.toUpperCase()} RISK
        </Badge>
      </div>

      <div className={styles.templateStats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Expected Return</span>
          <span className={styles.statValue}>{template.expectedReturn}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Time Horizon</span>
          <span className={styles.statValue}>{template.timeHorizon}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Assets</span>
          <span className={styles.statValue}>{template.assets.length} holdings</span>
        </div>
      </div>

      <div className={styles.templateAssets}>
        <h4 className={styles.assetsTitle}>Top Holdings</h4>
        <div className={styles.assetsList}>
          {template.assets.slice(0, 4).map((asset, index) => (
            <div key={index} className={styles.assetItem}>
              <span className={styles.assetTicker}>{asset.ticker}</span>
              <span className={styles.assetWeight}>
                {formatPercentage(asset.weight / 100)}
              </span>
            </div>
          ))}
          {template.assets.length > 4 && (
            <div className={styles.assetItem}>
              <span className={styles.assetMore}>
                +{template.assets.length - 4} more
              </span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.templateTags}>
        {template.tags.slice(0, 3).map((tag, index) => (
          <Badge key={index} size="small" className={styles.tag}>
            {tag}
          </Badge>
        ))}
      </div>

      <div className={styles.templateActions}>
        <Button
          onClick={() => handlePreviewTemplate(template)}
          variant="ghost"
          size="small"
        >
          Preview
        </Button>
        <Button
          onClick={() => handleSelectTemplate(template)}
          variant="primary"
          size="small"
        >
          Use Template
        </Button>
      </div>
    </Card>
  );

  const TemplatePreview = ({ template }: { template: PortfolioTemplate }) => (
    <div className={styles.previewContent}>
      <div className={styles.previewHeader}>
        <div className={styles.previewIcon}>{template.icon}</div>
        <div>
          <h2 className={styles.previewTitle}>{template.name}</h2>
          <p className={styles.previewDescription}>{template.description}</p>
        </div>
      </div>

      <div className={styles.previewStats}>
        <div className={styles.previewStat}>
          <span className={styles.previewStatLabel}>Strategy</span>
          <span className={styles.previewStatValue}>{template.strategy}</span>
        </div>
        <div className={styles.previewStat}>
          <span className={styles.previewStatLabel}>Risk Level</span>
          <Badge color={getRiskLevelColor(template.riskLevel)}>
            {template.riskLevel.toUpperCase()}
          </Badge>
        </div>
        <div className={styles.previewStat}>
          <span className={styles.previewStatLabel}>Expected Return</span>
          <span className={styles.previewStatValue}>{template.expectedReturn}</span>
        </div>
        <div className={styles.previewStat}>
          <span className={styles.previewStatLabel}>Time Horizon</span>
          <span className={styles.previewStatValue}>{template.timeHorizon}</span>
        </div>
      </div>

      <div className={styles.previewAssets}>
        <h3 className={styles.previewAssetsTitle}>Portfolio Composition</h3>
        <div className={styles.previewAssetsList}>
          {template.assets.map((asset, index) => (
            <div key={index} className={styles.previewAssetItem}>
              <div className={styles.previewAssetInfo}>
                <span className={styles.previewAssetTicker}>{asset.ticker}</span>
                <span className={styles.previewAssetName}>{asset.name}</span>
                <span className={styles.previewAssetSector}>{asset.sector}</span>
              </div>
              <span className={styles.previewAssetWeight}>
                {formatPercentage(asset.weight / 100)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.previewTags}>
        <h4 className={styles.previewTagsTitle}>Tags</h4>
        <div className={styles.previewTagsList}>
          {template.tags.map((tag, index) => (
            <Badge key={index} size="small">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className={styles.previewActions}>
        <Button
          onClick={() => setShowPreview(null)}
          variant="ghost"
        >
          Back
        </Button>
        <Button
          onClick={() => {
            handleSelectTemplate(template);
            setShowPreview(null);
          }}
          variant="primary"
        >
          Use This Template
        </Button>
      </div>
    </div>
  );

  const content = (
    <div className={classNames(styles.container, className)}>
      {!showPreview ? (
        <>
          <div className={styles.header}>
            <h2 className={styles.title}>Choose Portfolio Template</h2>
            <p className={styles.subtitle}>
              Start with a proven strategy or create your own
            </p>
          </div>

          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Risk Level:</span>
              <div className={styles.filterButtons}>
                {['all', 'low', 'medium', 'high'].map((risk) => (
                  <Button
                    key={risk}
                    onClick={() => setFilterRisk(risk as any)}
                    variant={filterRisk === risk ? 'primary' : 'ghost'}
                    size="small"
                  >
                    {risk === 'all' ? 'All' : risk.charAt(0).toUpperCase() + risk.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.templatesGrid}>
            {filteredTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>

          <div className={styles.footerActions}>
            {onCancel && (
              <Button onClick={onCancel} variant="ghost">
                Skip Templates
              </Button>
            )}
            <Button
              onClick={onCancel}
              variant="secondary"
            >
              Create Custom Portfolio
            </Button>
          </div>
        </>
      ) : (
        <TemplatePreview template={showPreview} />
      )}
    </div>
  );

  if (showAsModal) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose || (() => {})}
        title="Portfolio Templates"
        size="large"
      >
        {content}
      </Modal>
    );
  }

  return content;
};

export default PortfolioTemplates;