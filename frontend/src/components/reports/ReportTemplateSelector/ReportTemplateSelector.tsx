/**
 * ReportTemplateSelector Component
 * Select and manage report templates
 */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from '../../common/Card/Card';
import { Button } from '../../common/Button/Button';
import { Input } from '../../common/Input/Input';
import { Select } from '../../common/Select/Select';
import { Badge } from '../../common/Badge/Badge';
import { Modal } from '../../common/Modal/Modal';
import { Checkbox } from '../../common/Checkbox/Checkbox';
import {
  loadReportTemplates,
  createReportTemplate
} from '../../../store/reports/actions';
import {
  selectReportTemplates,
  selectSystemTemplates,
  selectCustomTemplates,
  selectIsLoadingTemplates,
  selectTemplatesError
} from '../../../store/reports/selectors';
import { ReportType, ReportFormat } from '../../../types/reports';
import { formatDate } from '../../../utils/formatters';
import styles from './ReportTemplateSelector.module.css';

interface ReportTemplateSelectorProps {
  selectedTemplateId?: string;
  onTemplateSelect?: (templateId: string) => void;
  onTemplateChange?: (template: any) => void;
  allowCustomTemplates?: boolean;
  className?: string;
  'data-testid'?: string;
}

export const ReportTemplateSelector: React.FC<ReportTemplateSelectorProps> = ({
  selectedTemplateId,
  onTemplateSelect,
  onTemplateChange,
  allowCustomTemplates = true,
  className,
  'data-testid': testId,
}) => {
  const dispatch = useDispatch();
  const allTemplates = useSelector(selectReportTemplates);
  const systemTemplates = useSelector(selectSystemTemplates);
  const customTemplates = useSelector(selectCustomTemplates);
  const isLoading = useSelector(selectIsLoadingTemplates);
  const error = useSelector(selectTemplatesError);

  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'system' | 'custom'>('system');

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    reportType: 'performance' as ReportType,
    format: 'pdf' as ReportFormat,
    sections: [] as string[],
    styleSettings: {},
  });

  useEffect(() => {
    dispatch(loadReportTemplates() as any);
  }, [dispatch]);

  useEffect(() => {
    if (selectedTemplateId) {
      const template = allTemplates.find(t => t.templateId === selectedTemplateId);
      setSelectedTemplate(template);
      onTemplateChange?.(template);
    }
  }, [selectedTemplateId, allTemplates, onTemplateChange]);

  const availableSections = [
    { id: 'summary', name: 'Executive Summary', description: 'High-level overview and key insights' },
    { id: 'performance', name: 'Performance Analysis', description: 'Returns, volatility, and performance metrics' },
    { id: 'risk', name: 'Risk Analysis', description: 'Risk metrics, drawdowns, and risk-adjusted returns' },
    { id: 'allocation', name: 'Asset Allocation', description: 'Current allocation and historical changes' },
    { id: 'holdings', name: 'Holdings Analysis', description: 'Top holdings and sector breakdown' },
    { id: 'benchmarks', name: 'Benchmark Comparison', description: 'Performance vs benchmarks' },
    { id: 'metrics', name: 'Key Metrics Table', description: 'Comprehensive metrics comparison' },
    { id: 'charts', name: 'Charts & Visualizations', description: 'Performance charts and graphs' },
    { id: 'commentary', name: 'Market Commentary', description: 'Market insights and analysis' },
    { id: 'recommendations', name: 'Recommendations', description: 'Portfolio optimization suggestions' },
  ];

  const reportTypeOptions = [
    { value: 'performance', label: 'Performance Report' },
    { value: 'risk', label: 'Risk Analysis Report' },
    { value: 'optimization', label: 'Optimization Report' },
    { value: 'scenario', label: 'Scenario Analysis Report' },
    { value: 'comprehensive', label: 'Comprehensive Report' },
    { value: 'custom', label: 'Custom Report' },
  ];

  const formatOptions = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'html', label: 'HTML Page' },
    { value: 'excel', label: 'Excel Spreadsheet' },
  ];

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    onTemplateSelect?.(template.templateId);
    onTemplateChange?.(template);
  };

  const handleCreateTemplate = async () => {
    try {
      const request = {
        name: newTemplate.name,
        description: newTemplate.description,
        reportType: newTemplate.reportType,
        format: newTemplate.format,
        sections: newTemplate.sections,
        styleSettings: newTemplate.styleSettings,
      };

      dispatch(createReportTemplate(request) as any);
      setIsCreateModalOpen(false);

      // Reset form
      setNewTemplate({
        name: '',
        description: '',
        reportType: 'performance',
        format: 'pdf',
        sections: [],
        styleSettings: {},
      });
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleSectionToggle = (sectionId: string) => {
    setNewTemplate(prev => ({
      ...prev,
      sections: prev.sections.includes(sectionId)
        ? prev.sections.filter(id => id !== sectionId)
        : [...prev.sections, sectionId],
    }));
  };

  const getTemplateIcon = (reportType: ReportType) => {
    switch (reportType) {
      case 'performance':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22,6 16,12 10,8 2,16"/>
            <polyline points="16,6 22,6 22,12"/>
          </svg>
        );
      case 'risk':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        );
      case 'optimization':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14,2 14,8 20,8"/>
          </svg>
        );
    }
  };

  const renderTemplateCard = (template: any) => (
    <Card
      key={template.templateId}
      className={`${styles.templateCard} ${
        selectedTemplate?.templateId === template.templateId ? styles.selected : ''
      }`}
      onClick={() => handleTemplateSelect(template)}
      hoverable
    >
      <div className={styles.templateHeader}>
        <div className={styles.templateIcon}>
          {getTemplateIcon(template.reportType || 'custom')}
        </div>
        <div className={styles.templateTitle}>
          <h4>{template.name}</h4>
          {template.isSystem && <Badge color="neutral" size="small">System</Badge>}
        </div>
      </div>

      {template.description && (
        <p className={styles.templateDescription}>{template.description}</p>
      )}

      <div className={styles.templateMeta}>
        <span className={styles.templateType}>
          {template.reportType?.charAt(0).toUpperCase() + template.reportType?.slice(1) || 'Custom'}
        </span>
        <span className={styles.templateFormat}>
          {template.format?.toUpperCase() || 'PDF'}
        </span>
        {template.createdAt && (
          <span className={styles.templateDate}>
            {formatDate(template.createdAt)}
          </span>
        )}
      </div>

      {template.sections && template.sections.length > 0 && (
        <div className={styles.templateSections}>
          <span className={styles.sectionsLabel}>Sections:</span>
          <div className={styles.sectionTags}>
            {template.sections.slice(0, 3).map((sectionId: string) => {
              const section = availableSections.find(s => s.id === sectionId);
              return section ? (
                <span key={sectionId} className={styles.sectionTag}>
                  {section.name}
                </span>
              ) : null;
            })}
            {template.sections.length > 3 && (
              <span className={styles.sectionTag}>
                +{template.sections.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
    </Card>
  );

  return (
    <div className={`${styles.container} ${className || ''}`} data-testid={testId}>
      <div className={styles.header}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'system' ? styles.active : ''}`}
            onClick={() => setActiveTab('system')}
          >
            System Templates ({systemTemplates.length})
          </button>
          {allowCustomTemplates && (
            <button
              className={`${styles.tab} ${activeTab === 'custom' ? styles.active : ''}`}
              onClick={() => setActiveTab('custom')}
            >
              Custom Templates ({customTemplates.length})
            </button>
          )}
        </div>

        {allowCustomTemplates && activeTab === 'custom' && (
          <Button
            variant="primary"
            size="small"
            onClick={() => setIsCreateModalOpen(true)}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            }
          >
            Create Template
          </Button>
        )}
      </div>

      {error && (
        <div className={styles.error}>
          <span>{error}</span>
        </div>
      )}

      <div className={styles.content}>
        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <span>Loading templates...</span>
          </div>
        ) : (
          <div className={styles.templatesGrid}>
            {activeTab === 'system' && systemTemplates.map(renderTemplateCard)}
            {activeTab === 'custom' && allowCustomTemplates && (
              customTemplates.length > 0 ? (
                customTemplates.map(renderTemplateCard)
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                      <polyline points="14,2 14,8 20,8"/>
                      <line x1="12" y1="18" x2="12" y2="12"/>
                      <line x1="9" y1="15" x2="15" y2="15"/>
                    </svg>
                  </div>
                  <h3>No Custom Templates</h3>
                  <p>Create your first custom template to get started.</p>
                  <Button
                    variant="primary"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    Create Template
                  </Button>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Create Template Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Report Template"
        size="large"
      >
        <div className={styles.createForm}>
          <div className={styles.formSection}>
            <h4>Basic Information</h4>
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <Input
                  label="Template Name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter template name..."
                  required
                />
              </div>

              <div className={styles.formField}>
                <Select
                  label="Report Type"
                  value={newTemplate.reportType}
                  onChange={(value) => setNewTemplate(prev => ({ ...prev, reportType: value as ReportType }))}
                  options={reportTypeOptions}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formField}>
                <Input
                  label="Description"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the template purpose..."
                />
              </div>

              <div className={styles.formField}>
                <Select
                  label="Default Format"
                  value={newTemplate.format}
                  onChange={(value) => setNewTemplate(prev => ({ ...prev, format: value as ReportFormat }))}
                  options={formatOptions}
                />
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h4>Report Sections</h4>
            <div className={styles.sectionsGrid}>
              {availableSections.map(section => (
                <div key={section.id} className={styles.sectionOption}>
                  <Checkbox
                    checked={newTemplate.sections.includes(section.id)}
                    onChange={() => handleSectionToggle(section.id)}
                    label={section.name}
                  />
                  <p className={styles.sectionDescription}>{section.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.formActions}>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              onClick={handleCreateTemplate}
              disabled={!newTemplate.name || newTemplate.sections.length === 0}
            >
              Create Template
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReportTemplateSelector;