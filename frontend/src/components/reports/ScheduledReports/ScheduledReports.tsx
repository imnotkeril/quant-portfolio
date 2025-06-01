/**
 * ScheduledReports Component
 * Manage scheduled report generation
 */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from '../../common/Card/Card';
import { Button } from '../../common/Button/Button';
import { Table } from '../../common/Table/Table';
import { Modal } from '../../common/Modal/Modal';
import { Select } from '../../common/Select/Select';
import { Input } from '../../common/Input/Input';
import { Checkbox } from '../../common/Checkbox/Checkbox';
import { Badge } from '../../common/Badge/Badge';
import {
  loadScheduledReports,
  scheduleReport,
  cancelScheduledReport
} from '../../../store/reports/actions';
import {
  selectScheduledReports,
  selectIsSchedulingReport,
  selectScheduleError,
  selectActiveScheduledReports
} from '../../../store/reports/selectors';
import { selectPortfolios } from '../../../store/portfolio/selectors';
import { ReportType, ReportFormat, ReportFrequency } from '../../../types/reports';
import { formatDate } from '../../../utils/formatters';
import styles from './ScheduledReports.module.css';

interface ScheduledReportsProps {
  portfolioId?: string;
  className?: string;
  'data-testid'?: string;
}

export const ScheduledReports: React.FC<ScheduledReportsProps> = ({
  portfolioId,
  className,
  'data-testid': testId,
}) => {
  const dispatch = useDispatch();
  const scheduledReports = useSelector(selectScheduledReports);
  const activeReports = useSelector(selectActiveScheduledReports);
  const isScheduling = useSelector(selectIsSchedulingReport);
  const scheduleError = useSelector(selectScheduleError);
  const portfolios = useSelector(selectPortfolios);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    portfolioId: portfolioId || '',
    reportType: 'performance' as ReportType,
    frequency: 'monthly' as ReportFrequency,
    email: '',
    reportParams: {
      format: 'pdf' as ReportFormat,
      sections: [] as string[],
      benchmark: '',
      includeCharts: true,
      includeCommentary: false,
    },
  });

  useEffect(() => {
    dispatch(loadScheduledReports() as any);
  }, [dispatch]);

  useEffect(() => {
    if (portfolioId) {
      setFormData(prev => ({ ...prev, portfolioId }));
    }
  }, [portfolioId]);

  const reportTypeOptions = [
    { value: 'performance', label: 'Performance Report' },
    { value: 'risk', label: 'Risk Analysis Report' },
    { value: 'comprehensive', label: 'Comprehensive Report' },
    { value: 'custom', label: 'Custom Report' },
  ];

  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'annual', label: 'Annual' },
  ];

  const formatOptions = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'html', label: 'HTML Page' },
    { value: 'excel', label: 'Excel Spreadsheet' },
  ];

  const portfolioOptions = portfolios.map(portfolio => ({
    value: portfolio.id,
    label: portfolio.name,
  }));

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('reportParams.')) {
      const paramField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        reportParams: {
          ...prev.reportParams,
          [paramField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleCreateSchedule = async () => {
    try {
      const request = {
        portfolioId: formData.portfolioId,
        reportType: formData.reportType,
        frequency: formData.frequency,
        email: formData.email || undefined,
        reportParams: formData.reportParams,
      };

      dispatch(scheduleReport(request) as any);
      setIsCreateModalOpen(false);

      // Reset form
      setFormData({
        portfolioId: portfolioId || '',
        reportType: 'performance',
        frequency: 'monthly',
        email: '',
        reportParams: {
          format: 'pdf',
          sections: [],
          benchmark: '',
          includeCharts: true,
          includeCommentary: false,
        },
      });
    } catch (error) {
      console.error('Error scheduling report:', error);
    }
  };

  const handleCancelSchedule = async (reportId: string) => {
    if (window.confirm('Are you sure you want to cancel this scheduled report?')) {
      dispatch(cancelScheduledReport(reportId) as any);
    }
  };

  const handleViewDetails = (report: any) => {
    setSelectedReport(report);
    setIsDetailModalOpen(true);
  };

  const handleToggleStatus = async (reportId: string, currentStatus: string) => {
    // This would typically call an API to toggle the status
    console.log(`Toggle status for report ${reportId} from ${currentStatus}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge color="success">Active</Badge>;
      case 'paused':
        return <Badge color="warning">Paused</Badge>;
      case 'completed':
        return <Badge color="neutral">Completed</Badge>;
      default:
        return <Badge color="neutral">{status}</Badge>;
    }
  };

  const getFrequencyIcon = (frequency: ReportFrequency) => {
    switch (frequency) {
      case 'daily':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
        );
      case 'weekly':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        );
    }
  };

  const columns = [
    {
      key: 'reportType',
      title: 'Type',
      width: '15%',
      render: (_: any, record: any) => (
        <span className={styles.reportType}>
          {record.reportType.charAt(0).toUpperCase() + record.reportType.slice(1)}
        </span>
      ),
    },
    {
      key: 'portfolioId',
      title: 'Portfolio',
      width: '20%',
      render: (_: any, record: any) => {
        const portfolio = portfolios.find(p => p.id === record.portfolioId);
        return portfolio?.name || record.portfolioId;
      },
    },
    {
      key: 'frequency',
      title: 'Frequency',
      width: '15%',
      render: (_: any, record: any) => (
        <div className={styles.frequencyCell}>
          {getFrequencyIcon(record.frequency)}
          <span>{record.frequency.charAt(0).toUpperCase() + record.frequency.slice(1)}</span>
        </div>
      ),
    },
    {
      key: 'nextRun',
      title: 'Next Run',
      width: '15%',
      render: (_: any, record: any) => record.nextRun ? formatDate(record.nextRun) : '-',
    },
    {
      key: 'lastGenerated',
      title: 'Last Generated',
      width: '15%',
      render: (_: any, record: any) => record.lastGenerated ? formatDate(record.lastGenerated) : 'Never',
    },
    {
      key: 'status',
      title: 'Status',
      width: '10%',
      render: (_: any, record: any) => getStatusBadge(record.status),
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '10%',
      render: (_: any, record: any) => (
        <div className={styles.actions}>
          <Button
            variant="text"
            size="small"
            onClick={() => handleViewDetails(record)}
          >
            Details
          </Button>
          <Button
            variant="text"
            size="small"
            onClick={() => handleToggleStatus(record.reportId, record.status)}
          >
            {record.status === 'active' ? 'Pause' : 'Resume'}
          </Button>
          <Button
            variant="text"
            size="small"
            onClick={() => handleCancelSchedule(record.reportId)}
            className={styles.dangerAction}
          >
            Cancel
          </Button>
        </div>
      ),
    },
  ] as any;

  return (
    <div className={`${styles.container} ${className || ''}`} data-testid={testId}>
      {/* Statistics */}
      <div className={styles.statistics}>
        <Card className={styles.statCard}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{scheduledReports.length}</span>
            <span className={styles.statLabel}>Total Scheduled</span>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{activeReports.length}</span>
            <span className={styles.statLabel}>Active</span>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.stat}>
            <span className={styles.statValue}>
              {scheduledReports.filter(r => r.status === 'paused').length}
            </span>
            <span className={styles.statLabel}>Paused</span>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Card
        title="Scheduled Reports"
        extra={
          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            }
          >
            Schedule Report
          </Button>
        }
        className={styles.tableCard}
      >
        {scheduleError && (
          <div className={styles.error}>
            <span>{scheduleError}</span>
          </div>
        )}

        <Table
          columns={columns}
          data={scheduledReports}
          rowKey={(record) => record.reportId || `scheduled-${Math.random()}`}
          loading={isScheduling}
          pagination={false}
          emptyText="No scheduled reports found"
        />
      </Card>

      {/* Create Schedule Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Schedule Report"
        size="large"
      >
        <div className={styles.createForm}>
          <div className={styles.formSection}>
            <h4>Basic Settings</h4>
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <Select
                  label="Portfolio"
                  value={formData.portfolioId}
                  onChange={(value) => handleInputChange('portfolioId', value)}
                  options={portfolioOptions}
                  placeholder="Select portfolio..."
                  required
                />
              </div>

              <div className={styles.formField}>
                <Select
                  label="Report Type"
                  value={formData.reportType}
                  onChange={(value) => handleInputChange('reportType', value)}
                  options={reportTypeOptions}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formField}>
                <Select
                  label="Frequency"
                  value={formData.frequency}
                  onChange={(value) => handleInputChange('frequency', value)}
                  options={frequencyOptions}
                />
              </div>

              <div className={styles.formField}>
                <Input
                  label="Email (Optional)"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="notifications@company.com"
                />
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h4>Report Parameters</h4>
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <Select
                  label="Format"
                  value={formData.reportParams.format}
                  onChange={(value) => handleInputChange('reportParams.format', value)}
                  options={formatOptions}
                />
              </div>

              <div className={styles.formField}>
                <Input
                  label="Benchmark (Optional)"
                  value={formData.reportParams.benchmark}
                  onChange={(e) => handleInputChange('reportParams.benchmark', e.target.value)}
                  placeholder="e.g., SPY, QQQ"
                />
              </div>
            </div>

            <div className={styles.checkboxSection}>
              <Checkbox
                checked={formData.reportParams.includeCharts}
                onChange={(e) => handleInputChange('reportParams.includeCharts', e.target.checked)}
                label="Include Charts & Visualizations"
              />

              <Checkbox
                checked={formData.reportParams.includeCommentary}
                onChange={(e) => handleInputChange('reportParams.includeCommentary', e.target.checked)}
                label="Include Commentary & Analysis"
              />
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
              onClick={handleCreateSchedule}
              loading={isScheduling}
              disabled={!formData.portfolioId}
            >
              Schedule Report
            </Button>
          </div>
        </div>
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Scheduled Report Details"
        size="medium"
      >
        {selectedReport && (
          <div className={styles.reportDetails}>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Report ID:</span>
                <span className={styles.detailValue}>{selectedReport.reportId}</span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Type:</span>
                <span className={styles.detailValue}>
                  {selectedReport.reportType.charAt(0).toUpperCase() + selectedReport.reportType.slice(1)}
                </span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Frequency:</span>
                <span className={styles.detailValue}>
                  {selectedReport.frequency.charAt(0).toUpperCase() + selectedReport.frequency.slice(1)}
                </span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Status:</span>
                <span className={styles.detailValue}>{getStatusBadge(selectedReport.status)}</span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Next Run:</span>
                <span className={styles.detailValue}>
                  {selectedReport.nextRun ? formatDate(selectedReport.nextRun) : 'Not scheduled'}
                </span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Last Generated:</span>
                <span className={styles.detailValue}>
                  {selectedReport.lastGenerated ? formatDate(selectedReport.lastGenerated) : 'Never'}
                </span>
              </div>

              {selectedReport.email && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Email:</span>
                  <span className={styles.detailValue}>{selectedReport.email}</span>
                </div>
              )}
            </div>

            <div className={styles.detailActions}>
              <Button
                variant="outline"
                onClick={() => handleToggleStatus(selectedReport.reportId, selectedReport.status)}
              >
                {selectedReport.status === 'active' ? 'Pause Schedule' : 'Resume Schedule'}
              </Button>

              <Button
                variant="danger"
                onClick={() => {
                  handleCancelSchedule(selectedReport.reportId);
                  setIsDetailModalOpen(false);
                }}
              >
                Cancel Schedule
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ScheduledReports;