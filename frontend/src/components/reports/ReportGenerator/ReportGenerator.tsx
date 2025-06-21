/**
 * ReportGenerator Component
 * Form for generating various types of reports
 */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Card from '../../common/Card/Card';
import { Button } from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import { Select } from '../../common/Select/Select';
import { Checkbox } from '../../common/Checkbox/Checkbox';
import { DateRangePicker } from '../../common/DateRangePicker';
import { Modal } from '../../common/Modal/Modal';
import { generateReport, generateComparisonReport } from '../../../store/reports/actions';
import { selectPortfolios } from '../../../store/portfolio/selectors';
import {
  selectIsGeneratingReport,
  selectGenerateError,
  selectReportTemplates
} from '../../../store/reports/selectors';
import { ReportType, ReportFormat } from '../../../types/reports';
import { formatDate } from '../../../utils/formatters';
import styles from './ReportGenerator.module.css';

interface ReportGeneratorProps {
  portfolioId?: string;
  isVisible?: boolean;
  onClose?: () => void;
  className?: string;
  'data-testid'?: string;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  portfolioId,
  isVisible = false,
  onClose,
  className,
  'data-testid': testId,
}) => {
  const dispatch = useDispatch();
  const portfolios = useSelector(selectPortfolios);
  const reportTemplates = useSelector(selectReportTemplates);
  const isGenerating = useSelector(selectIsGeneratingReport);
  const generateError = useSelector(selectGenerateError);

  const [formData, setFormData] = useState({
    portfolioId: portfolioId || '',
    reportType: 'performance' as ReportType,
    format: 'pdf' as ReportFormat,
    startDate: '',
    endDate: '',
    benchmark: '',
    sections: [] as string[],
    templateId: '',
    title: '',
    description: '',
    runInBackground: false,
    emailRecipients: '',
  });

  const [isComparison, setIsComparison] = useState(false);
  const [comparisonPortfolioIds, setComparisonPortfolioIds] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  useEffect(() => {
    if (portfolioId) {
      setFormData(prev => ({ ...prev, portfolioId }));
    }
  }, [portfolioId]);

  useEffect(() => {
    if (formData.templateId) {
      const template = reportTemplates.find(t => t.templateId === formData.templateId);
      setSelectedTemplate(template);
      if (template) {
        setFormData(prev => ({
          ...prev,
          reportType: (template as any).reportType || prev.reportType,
          format: (template as any).format || prev.format,
          sections: ((template as any).sections as string[]) || [],
        }));
      }
    }
  }, [formData.templateId, reportTemplates]);

  const reportTypeOptions = [
    { value: 'performance', label: 'Performance Report' },
    { value: 'risk', label: 'Risk Analysis Report' },
    { value: 'optimization', label: 'Optimization Report' },
    { value: 'scenario', label: 'Scenario Analysis Report' },
    { value: 'historical', label: 'Historical Analysis Report' },
    { value: 'comparison', label: 'Portfolio Comparison' },
    { value: 'comprehensive', label: 'Comprehensive Report' },
    { value: 'custom', label: 'Custom Report' },
  ];

  const formatOptions = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'html', label: 'HTML Page' },
    { value: 'excel', label: 'Excel Spreadsheet' },
    { value: 'json', label: 'JSON Data' },
    { value: 'csv', label: 'CSV Data' },
  ];

  const availableSections = [
    { id: 'summary', name: 'Executive Summary', required: true },
    { id: 'performance', name: 'Performance Analysis', required: false },
    { id: 'risk', name: 'Risk Analysis', required: false },
    { id: 'allocation', name: 'Asset Allocation', required: false },
    { id: 'returns', name: 'Returns Analysis', required: false },
    { id: 'benchmarks', name: 'Benchmark Comparison', required: false },
    { id: 'metrics', name: 'Key Metrics', required: false },
    { id: 'charts', name: 'Charts & Visualizations', required: false },
    { id: 'commentary', name: 'Commentary', required: false },
    { id: 'recommendations', name: 'Recommendations', required: false },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSectionToggle = (sectionId: string) => {
    const section = availableSections.find(s => s.id === sectionId);
    if (section?.required) return; // Can't toggle required sections

    setFormData(prev => ({
      ...prev,
      sections: prev.sections.includes(sectionId)
        ? prev.sections.filter(id => id !== sectionId)
        : [...prev.sections, sectionId],
    }));
  };

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setFormData(prev => ({
      ...prev,
      startDate,
      endDate,
    }));
  };

  const handleComparisonPortfoliosChange = (portfolioIds: string[]) => {
    setComparisonPortfolioIds(portfolioIds);
  };

  const validateForm = () => {
    if (!formData.portfolioId) {
      return 'Please select a portfolio';
    }

    if (isComparison && comparisonPortfolioIds.length === 0) {
      return 'Please select portfolios to compare';
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        return 'End date must be after start date';
      }
    }

    return null;
  };

  const handleGenerate = async () => {
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    try {
      const baseRequest = {
        portfolioId: formData.portfolioId,
        reportType: formData.reportType,
        format: formData.format,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        benchmark: formData.benchmark || undefined,
        sections: formData.sections.length > 0 ? formData.sections : undefined,
        runInBackground: formData.runInBackground,
      };

      if (isComparison) {
        const comparisonRequest = {
          portfolioIds: [formData.portfolioId, ...comparisonPortfolioIds],
          reportType: formData.reportType,
          format: formData.format,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
          benchmark: formData.benchmark || undefined,
          sections: formData.sections.length > 0 ? formData.sections : undefined,
          runInBackground: formData.runInBackground,
        };

        dispatch(generateComparisonReport(comparisonRequest) as any);
      } else {
        dispatch(generateReport(baseRequest) as any);
      }

      if (!formData.runInBackground && onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const handleReset = () => {
    setFormData({
      portfolioId: portfolioId || '',
      reportType: 'performance',
      format: 'pdf',
      startDate: '',
      endDate: '',
      benchmark: '',
      sections: [],
      templateId: '',
      title: '',
      description: '',
      runInBackground: false,
      emailRecipients: '',
    });
    setIsComparison(false);
    setComparisonPortfolioIds([]);
    setSelectedTemplate(null);
  };

  const portfolioOptions = portfolios.map(portfolio => ({
    value: portfolio.id,
    label: portfolio.name,
  }));

  const templateOptions = reportTemplates.map(template => ({
    value: template.templateId,
    label: template.name,
  }));

  return (
    <Modal
      isOpen={isVisible}
      onClose={onClose || (() => {})}
      title="Generate Report"
      size="large"
      data-testid={testId}
    >
      <div className={styles.container}>
        {generateError && (
          <div className={styles.error}>
            <span>{generateError}</span>
          </div>
        )}

        <div className={styles.form}>
          {/* Basic Settings */}
          <Card title="Basic Settings" className={styles.section}>
            <div className={styles.row}>
              <div className={styles.field}>
                <Select
                  label="Portfolio"
                  value={formData.portfolioId}
                  onChange={(value) => handleInputChange('portfolioId', value)}
                  options={portfolioOptions}
                  placeholder="Select portfolio..."
                  required
                />
              </div>

              <div className={styles.field}>
                <Select
                  label="Report Type"
                  value={formData.reportType}
                  onChange={(value) => handleInputChange('reportType', value)}
                  options={reportTypeOptions}
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <Select
                  label="Format"
                  value={formData.format}
                  onChange={(value) => handleInputChange('format', value)}
                  options={formatOptions}
                />
              </div>

              <div className={styles.field}>
                <Select
                  label="Template (Optional)"
                  value={formData.templateId}
                  onChange={(value) => handleInputChange('templateId', value)}
                  options={templateOptions}
                  placeholder="Select template..."
                />
              </div>
            </div>

            <div className={styles.checkboxRow}>
              <Checkbox
                checked={isComparison}
                onChange={(e) => setIsComparison(e.target.checked)}
                label="Portfolio Comparison Report"
              />
            </div>

            {isComparison && (
              <div className={styles.field}>
                <Select
                  label="Portfolios to Compare"
                  value={comparisonPortfolioIds}
                  onChange={(value) => handleComparisonPortfoliosChange(
                    Array.isArray(value) ? value.map(String) : [String(value)]
                  )}
                  options={portfolioOptions.filter(opt => opt.value !== formData.portfolioId)}
                  multiple
                  placeholder="Select portfolios to compare..."
                />
              </div>
            )}
          </Card>

          {/* Date Range */}
          <Card title="Date Range" className={styles.section}>
            <DateRangePicker
              startDate={formData.startDate}
              endDate={formData.endDate}
              onChange={handleDateRangeChange}
              placeholder="Select date range for analysis..."
            />
          </Card>

          {/* Report Sections */}
          <Card title="Report Sections" className={styles.section}>
            <div className={styles.sectionsGrid}>
              {availableSections.map(section => (
                <div key={section.id} className={styles.sectionItem}>
                  <Checkbox
                    checked={formData.sections.includes(section.id) || section.required}
                    onChange={() => handleSectionToggle(section.id)}
                    disabled={section.required}
                    label={section.name}
                  />
                  {section.required && (
                    <span className={styles.requiredLabel}>(Required)</span>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Advanced Options */}
          <Card title="Advanced Options" className={styles.section}>
            <div className={styles.row}>
              <div className={styles.field}>
                <Input
                  label="Benchmark (Optional)"
                  value={formData.benchmark}
                  onChange={(e) => handleInputChange('benchmark', e.target.value)}
                  placeholder="e.g., SPY, QQQ, Custom benchmark..."
                />
              </div>

              <div className={styles.field}>
                <Input
                  label="Report Title (Optional)"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Custom report title..."
                />
              </div>
            </div>

            <div className={styles.field}>
              <Input
                label="Description (Optional)"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Report description or notes..."
              />
            </div>

            <div className={styles.checkboxRow}>
              <Checkbox
                checked={formData.runInBackground}
                onChange={(e) => handleInputChange('runInBackground', e.target.checked)}
                label="Run in background (for large reports)"
              />
            </div>
          </Card>

          {/* Template Preview */}
          {selectedTemplate && (
            <Card title="Template Preview" className={styles.section}>
              <div className={styles.templatePreview}>
                <div className={styles.templateInfo}>
                  <h4>{selectedTemplate.name}</h4>
                  {selectedTemplate.description && (
                    <p>{selectedTemplate.description}</p>
                  )}
                </div>
                <div className={styles.templateSections}>
                  <strong>Included Sections:</strong>
                  <ul>
                    {((selectedTemplate as any).sections as string[])?.map((sectionId: string) => {
                      const section = availableSections.find(s => s.id === sectionId);
                      return section ? <li key={sectionId}>{section.name}</li> : null;
                    })}
                  </ul>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isGenerating}
          >
            Reset
          </Button>

          <div className={styles.primaryActions}>
            <Button
              variant="secondary"
              onClick={onClose || (() => {})}
              disabled={isGenerating}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              onClick={handleGenerate}
              loading={isGenerating}
              disabled={!formData.portfolioId}
            >
              Generate Report
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ReportGenerator;