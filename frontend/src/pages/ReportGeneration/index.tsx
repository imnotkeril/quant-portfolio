/**
 * Report Generation Page
 * Create, schedule, and manage portfolio reports
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { PageContainer } from '../../components/layout/PageContainer/PageContainer';
import Card from '../../components/common/Card/Card';
import { Button } from '../../components/common/Button/Button';
import { Select } from '../../components/common/Select/Select';
import { Input } from '../../components/common/Input/Input';
import { ReportGenerator } from '../../components/reports/ReportGenerator/ReportGenerator';
import { ReportTemplateSelector } from '../../components/reports/ReportTemplateSelector/ReportTemplateSelector';
import { ReportPreview } from '../../components/reports/ReportPreview/ReportPreview';
import { ReportHistory } from '../../components/reports/ReportHistory/ReportHistory';
import { ScheduledReports } from '../../components/reports/ScheduledReports/ScheduledReports';
import { usePortfolios } from '../../hooks/usePortfolios';
import { useReports } from '../../hooks/useReports';
import {
  selectPortfolios,
  selectPortfoliosLoading
} from '../../store/portfolio/selectors';
import {
  selectReportTemplates,
  selectReportHistory,
  selectScheduledReports,
  selectIsAnyLoading,
  selectCurrentReport
} from '../../store/reports/selectors';
import { formatDate } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';
import styles from './ReportGeneration.module.css';

interface ReportTab {
  id: string;
  title: string;
  component: React.ReactNode;
}

interface ReportConfig {
  name: string;
  description: string;
  portfolioIds: string[];
  templateId: string;
  format: 'PDF' | 'HTML' | 'EXCEL';
  sections: string[];
  timeframe: string;
  benchmark: string;
  includeCharts: boolean;
  includeRiskAnalysis: boolean;
  includeOptimization: boolean;
  customizations: Record<string, any>;
}

const ReportGeneration: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Hooks
  const portfolios = usePortfolios();
  const reports = useReports();

  // Selectors
  const portfoliosList = useSelector(selectPortfolios);
  const portfoliosLoading = useSelector(selectPortfoliosLoading);
  const reportTemplates = useSelector(selectReportTemplates);
  const reportHistory = useSelector(selectReportHistory);
  const scheduledReports = useSelector(selectScheduledReports);
  const reportsLoading = useSelector(selectReportsLoading);
  const currentReport = useSelector(selectCurrentReport);

  // Local state
  const [activeTab, setActiveTab] = useState('create');
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    name: '',
    description: '',
    portfolioIds: [],
    templateId: 'comprehensive',
    format: 'PDF',
    sections: ['summary', 'performance', 'risk', 'holdings'],
    timeframe: '1Y',
    benchmark: 'SPY',
    includeCharts: true,
    includeRiskAnalysis: true,
    includeOptimization: false,
    customizations: {},
  });

  // Load data
  useEffect(() => {
    portfolios.loadPortfolios();
    reports.loadTemplates();
    reports.loadReportHistory();
    reports.loadScheduledReports();
  }, []);

  // Options
  const portfolioOptions = portfoliosList.map(p => ({
    value: p.id,
    label: p.name,
  }));

  const templateOptions = reportTemplates?.map(t => ({
    value: t.id,
    label: t.name,
  })) || [
    { value: 'comprehensive', label: 'Comprehensive Analysis' },
    { value: 'executive_summary', label: 'Executive Summary' },
    { value: 'risk_report', label: 'Risk Assessment' },
    { value: 'performance_report', label: 'Performance Review' },
    { value: 'custom', label: 'Custom Report' },
  ];

  const formatOptions = [
    { value: 'PDF', label: 'PDF Document' },
    { value: 'HTML', label: 'HTML Report' },
    { value: 'EXCEL', label: 'Excel Workbook' },
  ];

  const timeframeOptions = [
    { value: '1M', label: '1 Month' },
    { value: '3M', label: '3 Months' },
    { value: '6M', label: '6 Months' },
    { value: '1Y', label: '1 Year' },
    { value: '2Y', label: '2 Years' },
    { value: '5Y', label: '5 Years' },
  ];

  const sectionOptions = [
    { value: 'summary', label: 'Executive Summary' },
    { value: 'performance', label: 'Performance Analysis' },
    { value: 'risk', label: 'Risk Assessment' },
    { value: 'holdings', label: 'Portfolio Holdings' },
    { value: 'optimization', label: 'Optimization Results' },
    { value: 'scenarios', label: 'Scenario Analysis' },
    { value: 'comparison', label: 'Benchmark Comparison' },
    { value: 'recommendations', label: 'Recommendations' },
  ];

  const handleConfigChange = (field: keyof ReportConfig, value: any) => {
    setReportConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateReport = async () => {
    if (reportConfig.portfolioIds.length === 0) {
      alert('Please select at least one portfolio');
      return;
    }

    await reports.generateReport(reportConfig);
  };

  const handleScheduleReport = async (schedule: any) => {
    await reports.scheduleReport({
      ...reportConfig,
      schedule,
    });
  };

  const handleDownloadReport = (reportId: string) => {
    reports.downloadReport(reportId);
  };

  // Create Tab
  const CreateTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.createGrid}>
        {/* Configuration */}
        <Card className={styles.configCard}>
          <h3 className={styles.cardTitle}>Report Configuration</h3>

          <div className={styles.configForm}>
            <Input
              label="Report Name *"
              value={reportConfig.name}
              onChange={(value) => handleConfigChange('name', value)}
              placeholder="Enter report name"
            />

            <Input
              label="Description"
              value={reportConfig.description}
              onChange={(value) => handleConfigChange('description', value)}
              placeholder="Describe this report"
              multiline
              rows={2}
            />

            <Select
              label="Portfolios *"
              value={reportConfig.portfolioIds}
              onChange={(value) => handleConfigChange('portfolioIds', value)}
              options={portfolioOptions}
              multiple
              placeholder="Select portfolios"
            />

            <div className={styles.formRow}>
              <Select
                label="Template"
                value={reportConfig.templateId}
                onChange={(value) => handleConfigChange('templateId', value)}
                options={templateOptions}
              />

              <Select
                label="Format"
                value={reportConfig.format}
                onChange={(value) => handleConfigChange('format', value)}
                options={formatOptions}
              />
            </div>

            <div className={styles.formRow}>
              <Select
                label="Timeframe"
                value={reportConfig.timeframe}
                onChange={(value) => handleConfigChange('timeframe', value)}
                options={timeframeOptions}
              />

              <Input
                label="Benchmark"
                value={reportConfig.benchmark}
                onChange={(value) => handleConfigChange('benchmark', value)}
                placeholder="SPY"
              />
            </div>

            <Select
              label="Sections"
              value={reportConfig.sections}
              onChange={(value) => handleConfigChange('sections', value)}
              options={sectionOptions}
              multiple
            />

            <div className={styles.checkboxGroup}>
              <h4>Additional Options</h4>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={reportConfig.includeCharts}
                  onChange={(e) => handleConfigChange('includeCharts', e.target.checked)}
                />
                <span>Include Charts and Visualizations</span>
              </label>

              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={reportConfig.includeRiskAnalysis}
                  onChange={(e) => handleConfigChange('includeRiskAnalysis', e.target.checked)}
                />
                <span>Include Risk Analysis</span>
              </label>

              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={reportConfig.includeOptimization}
                  onChange={(e) => handleConfigChange('includeOptimization', e.target.checked)}
                />
                <span>Include Optimization Recommendations</span>
              </label>
            </div>
          </div>

          <div className={styles.generateActions}>
            <Button
              onClick={handleGenerateReport}
              variant="primary"
              size="large"
              loading={reportsLoading}
              disabled={reportConfig.portfolioIds.length === 0}
            >
              {reportsLoading ? 'Generating...' : 'Generate Report'}
            </Button>

            <Button
              onClick={() => setActiveTab('schedule')}
              variant="secondary"
              disabled={reportConfig.portfolioIds.length === 0}
            >
              Schedule Report
            </Button>
          </div>
        </Card>

        {/* Preview */}
        <Card className={styles.previewCard}>
          <h3 className={styles.cardTitle}>Report Preview</h3>
          {currentReport ? (
            <ReportPreview
              report={currentReport}
              config={reportConfig}
            />
          ) : (
            <div className={styles.noPreview}>
              <div className={styles.noPreviewIcon}>📄</div>
              <p>Generate a report to see preview</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );

  // Templates Tab
  const TemplatesTab = () => (
    <div className={styles.tabContent}>
      <Card className={styles.templatesCard}>
        <h3 className={styles.cardTitle}>Report Templates</h3>
        <ReportTemplateSelector
          templates={reportTemplates || []}
          selectedTemplate={reportConfig.templateId}
          onTemplateSelect={(templateId) => handleConfigChange('templateId', templateId)}
        />
      </Card>
    </div>
  );

  // History Tab
  const HistoryTab = () => (
    <div className={styles.tabContent}>
      <Card className={styles.historyCard}>
        <h3 className={styles.cardTitle}>Report History</h3>
        {reportHistory && reportHistory.length > 0 ? (
          <ReportHistory
            reports={reportHistory}
            onDownload={handleDownloadReport}
            onRegenerate={(reportId) => {
              // Load report config and regenerate
              console.log('Regenerate report:', reportId);
            }}
          />
        ) : (
          <div className={styles.noHistory}>
            <div className={styles.noHistoryIcon}>📁</div>
            <h4>No Reports Generated</h4>
            <p>Your generated reports will appear here</p>
            <Button
              onClick={() => setActiveTab('create')}
              variant="primary"
            >
              Create First Report
            </Button>
          </div>
        )}
      </Card>
    </div>
  );

  // Schedule Tab
  const ScheduleTab = () => (
    <div className={styles.tabContent}>
      <Card className={styles.scheduleCard}>
        <h3 className={styles.cardTitle}>Scheduled Reports</h3>
        {scheduledReports && scheduledReports.length > 0 ? (
          <ScheduledReports
            scheduledReports={scheduledReports}
            onScheduleChange={handleScheduleReport}
          />
        ) : (
          <div className={styles.noScheduled}>
            <div className={styles.noScheduledIcon}>⏰</div>
            <h4>No Scheduled Reports</h4>
            <p>Set up automated report generation</p>
            <div className={styles.scheduleInfo}>
              <h5>Benefits of Scheduled Reports:</h5>
              <ul>
                <li>Automatic regular updates</li>
                <li>Consistent monitoring</li>
                <li>Email delivery options</li>
                <li>Custom frequency settings</li>
              </ul>
            </div>
          </div>
        )}
      </Card>
    </div>
  );

  const tabs: ReportTab[] = [
    { id: 'create', title: 'Create Report', component: <CreateTab /> },
    { id: 'templates', title: 'Templates', component: <TemplatesTab /> },
    { id: 'history', title: 'History', component: <HistoryTab /> },
    { id: 'schedule', title: 'Scheduled', component: <ScheduleTab /> },
  ];

  if (portfoliosLoading) {
    return (
      <PageContainer>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading portfolios...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Report Generation</h1>
          <p className={styles.subtitle}>
            Create comprehensive portfolio reports and schedule automated updates
          </p>
        </div>

        {/* Quick Actions */}
        <Card className={styles.quickActionsCard}>
          <div className={styles.quickActions}>
            <div className={styles.quickAction}>
              <div className={styles.actionIcon}>📊</div>
              <div className={styles.actionContent}>
                <h4>Performance Report</h4>
                <p>Comprehensive portfolio performance analysis</p>
              </div>
              <Button
                onClick={() => {
                  setReportConfig(prev => ({
                    ...prev,
                    templateId: 'performance_report',
                    sections: ['summary', 'performance', 'comparison'],
                  }));
                  setActiveTab('create');
                }}
                variant="ghost"
                size="small"
              >
                Use Template
              </Button>
            </div>

            <div className={styles.quickAction}>
              <div className={styles.actionIcon}>🛡️</div>
              <div className={styles.actionContent}>
                <h4>Risk Assessment</h4>
                <p>Detailed risk analysis and stress testing</p>
              </div>
              <Button
                onClick={() => {
                  setReportConfig(prev => ({
                    ...prev,
                    templateId: 'risk_report',
                    sections: ['summary', 'risk', 'scenarios'],
                    includeRiskAnalysis: true,
                  }));
                  setActiveTab('create');
                }}
                variant="ghost"
                size="small"
              >
                Use Template
              </Button>
            </div>

            <div className={styles.quickAction}>
              <div className={styles.actionIcon}>📋</div>
              <div className={styles.actionContent}>
                <h4>Executive Summary</h4>
                <p>High-level overview for stakeholders</p>
              </div>
              <Button
                onClick={() => {
                  setReportConfig(prev => ({
                    ...prev,
                    templateId: 'executive_summary',
                    sections: ['summary', 'performance'],
                  }));
                  setActiveTab('create');
                }}
                variant="ghost"
                size="small"
              >
                Use Template
              </Button>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Card className={styles.tabsCard}>
          <div className={styles.tabs}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.title}
              </button>
            ))}
          </div>
        </Card>

        {/* Content */}
        <div className={styles.content}>
          {tabs.find(tab => tab.id === activeTab)?.component}
        </div>
      </div>
    </PageContainer>
  );
};

export default ReportGeneration;