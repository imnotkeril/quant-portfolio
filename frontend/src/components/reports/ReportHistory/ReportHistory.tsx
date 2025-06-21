/**
 * ReportHistory Component
 * View and manage historical reports
 */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Card from '../../common/Card/Card';
import { Button } from '../../common/Button/Button';
import { Table } from '../../common/Table/Table';
import Input from '../../common/Input/Input';
import { Select } from '../../common/Select/Select';
import { DateRangePicker } from '../../common/DateRangePicker';
import Badge from '../../common/Badge/Badge';
import { Modal } from '../../common/Modal/Modal';
import {
  loadReportHistory,
  downloadReport
} from '../../../store/reports/actions';
import { selectPortfolios } from '../../../store/portfolio/selectors';
import { ReportType, ReportFormat } from '../../../types/reports';
import { formatDate, formatFileSize } from '../../../utils/formatters';
import styles from './ReportHistory.module.css';

interface ReportHistoryProps {
  portfolioId?: string;
  className?: string;
  'data-testid'?: string;
}

export const ReportHistory: React.FC<ReportHistoryProps> = ({
  portfolioId,
  className,
  'data-testid': testId,
}) => {
  const dispatch = useDispatch();
  const portfolios = useSelector(selectPortfolios);

  // Local state for reports and filters
  const [reportHistory, setReportHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [localFilters, setLocalFilters] = useState({
    portfolioId: portfolioId || '',
    reportType: '',
    startDate: '',
    endDate: '',
  });

  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Mock statistics - in real app would come from Redux
  const statistics = {
    total: reportHistory.length,
    completed: reportHistory.filter(r => r.status === 'completed').length,
    failed: reportHistory.filter(r => r.status === 'failed').length,
    successRate: reportHistory.length > 0
      ? (reportHistory.filter(r => r.status === 'completed').length / reportHistory.length) * 100
      : 0
  };

  useEffect(() => {
    handleLoadReports();
  }, [dispatch]);

  useEffect(() => {
    if (portfolioId && !localFilters.portfolioId) {
      setLocalFilters(prev => ({ ...prev, portfolioId }));
    }
  }, [portfolioId]);

  const handleLoadReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await dispatch(loadReportHistory(localFilters) as any);
      if (result.payload) {
        setReportHistory(result.payload);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  const reportTypeOptions = [
    { value: '', label: 'All Report Types' },
    { value: 'performance', label: 'Performance' },
    { value: 'risk', label: 'Risk Analysis' },
    { value: 'optimization', label: 'Optimization' },
    { value: 'scenario', label: 'Scenario Analysis' },
    { value: 'historical', label: 'Historical Analysis' },
    { value: 'comparison', label: 'Portfolio Comparison' },
    { value: 'comprehensive', label: 'Comprehensive' },
    { value: 'custom', label: 'Custom' },
  ];

  const portfolioOptions = [
    { value: '', label: 'All Portfolios' },
    ...portfolios.map(portfolio => ({
      value: portfolio.id,
      label: portfolio.name,
    })),
  ];

  const handleFilterChange = (field: string, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setLocalFilters(prev => ({
      ...prev,
      startDate,
      endDate,
    }));
  };

  const handleClearFilters = () => {
    setLocalFilters({
      portfolioId: portfolioId || '',
      reportType: '',
      startDate: '',
      endDate: '',
    });
    setSearchText('');
  };

  const handleRefresh = () => {
    handleLoadReports();
  };

  const handleDownload = async (reportId: string) => {
    try {
      await dispatch(downloadReport(reportId) as any);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleViewDetails = (report: any) => {
    setSelectedReport(report);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetails = () => {
    setSelectedReport(null);
    setIsDetailModalOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge color="success">Completed</Badge>;
      case 'failed':
        return <Badge color="danger">Failed</Badge>;
      case 'processing':
        return <Badge color="warning">Processing</Badge>;
      default:
        return <Badge color="neutral">{status}</Badge>;
    }
  };

  const getFormatIcon = (format: ReportFormat) => {
    switch (format) {
      case 'pdf':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14,2 14,8 20,8"/>
            <path d="M10,12h4"/>
            <path d="M10,16h4"/>
          </svg>
        );
      case 'excel':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14,2 14,8 20,8"/>
            <path d="M9,12l6,6"/>
            <path d="M15,12l-6,6"/>
          </svg>
        );
      case 'html':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="16,18 22,12 16,6"/>
            <polyline points="8,6 2,12 8,18"/>
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14,2 14,8 20,8"/>
          </svg>
        );
    }
  };

  // Apply search filter
  const filteredData = reportHistory.filter(report => {
    // Apply search text filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      const matchesSearch = (
        report.reportType?.toLowerCase().includes(searchLower) ||
        report.portfolioId?.toLowerCase().includes(searchLower) ||
        report.parameters?.title?.toLowerCase().includes(searchLower)
      );
      if (!matchesSearch) return false;
    }

    // Apply other filters
    if (localFilters.portfolioId && report.portfolioId !== localFilters.portfolioId) {
      return false;
    }
    if (localFilters.reportType && report.reportType !== localFilters.reportType) {
      return false;
    }

    return true;
  });

  const columns = [
    {
      key: 'reportType',
      title: 'Type',
      width: '15%',
      render: (_: any, record: any) => (
        <span className={styles.reportType}>
          {record.reportType?.charAt(0).toUpperCase() + record.reportType?.slice(1)}
        </span>
      ),
    },
    {
      key: 'format',
      title: 'Format',
      width: '10%',
      render: (_: any, record: any) => (
        <div className={styles.formatCell}>
          {getFormatIcon(record.format)}
          <span>{record.format?.toUpperCase()}</span>
        </div>
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
      key: 'generatedAt',
      title: 'Generated',
      width: '15%',
      render: (_: any, record: any) => record.generatedAt ? formatDate(record.generatedAt) : '-',
    },
    {
      key: 'status',
      title: 'Status',
      width: '10%',
      render: (_: any, record: any) => getStatusBadge(record.status),
    },
    {
      key: 'fileSize',
      title: 'Size',
      width: '10%',
      render: (_: any, record: any) => record.fileSize ? formatFileSize(record.fileSize) : '-',
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '20%',
      render: (_: any, record: any) => (
        <div className={styles.actions}>
          <Button
            variant="text"
            size="small"
            onClick={() => handleViewDetails(record)}
          >
            Details
          </Button>
          {record.status === 'completed' && record.filePath && (
            <Button
              variant="text"
              size="small"
              onClick={() => handleDownload(record.reportId)}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              }
            >
              Download
            </Button>
          )}
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
            <span className={styles.statValue}>{statistics.total}</span>
            <span className={styles.statLabel}>Total Reports</span>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{statistics.completed}</span>
            <span className={styles.statLabel}>Completed</span>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{statistics.failed}</span>
            <span className={styles.statLabel}>Failed</span>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{statistics.successRate.toFixed(1)}%</span>
            <span className={styles.statLabel}>Success Rate</span>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card title="Filters" className={styles.filtersCard}>
        <div className={styles.filters}>
          <div className={styles.filterRow}>
            <div className={styles.filterField}>
              <Input
                placeholder="Search reports..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                  </svg>
                }
              />
            </div>

            <div className={styles.filterField}>
              <Select
                placeholder="Portfolio"
                value={localFilters.portfolioId || ''}
                onChange={(value) => handleFilterChange('portfolioId', value)}
                options={portfolioOptions}
              />
            </div>

            <div className={styles.filterField}>
              <Select
                placeholder="Report Type"
                value={localFilters.reportType || ''}
                onChange={(value) => handleFilterChange('reportType', value)}
                options={reportTypeOptions}
              />
            </div>
          </div>

          <div className={styles.filterRow}>
            <div className={styles.dateFilter}>
              <DateRangePicker
                startDate={localFilters.startDate || ''}
                endDate={localFilters.endDate || ''}
                onChange={handleDateRangeChange}
                placeholder="Select date range..."
              />
            </div>

            <div className={styles.filterActions}>
              <Button
                variant="outline"
                onClick={handleClearFilters}
                disabled={!localFilters.portfolioId && !localFilters.reportType && !localFilters.startDate}
              >
                Clear
              </Button>

              <Button
                variant="outline"
                onClick={handleRefresh}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 4 23 10 17 10"/>
                    <polyline points="1 20 1 14 7 14"/>
                    <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                  </svg>
                }
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Reports Table */}
      <Card title="Report History" className={styles.tableCard}>
        {error && (
          <div className={styles.error}>
            <span>{error}</span>
          </div>
        )}

        <Table
          columns={columns}
          data={filteredData}
          rowKey={(record) => record.reportId || `report-${Math.random()}`}
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredData.length,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} reports`,
            onChange: setCurrentPage,
            onShowSizeChange: (current, size) => setPageSize(size),
          }}
          emptyText="No reports found"
        />
      </Card>

      {/* Report Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetails}
        title="Report Details"
        size="large"
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
                  {selectedReport.reportType?.charAt(0).toUpperCase() + selectedReport.reportType?.slice(1)}
                </span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Format:</span>
                <span className={styles.detailValue}>{selectedReport.format?.toUpperCase()}</span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Status:</span>
                <span className={styles.detailValue}>{getStatusBadge(selectedReport.status)}</span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Generated:</span>
                <span className={styles.detailValue}>
                  {selectedReport.generatedAt ? formatDate(selectedReport.generatedAt) : '-'}
                </span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Duration:</span>
                <span className={styles.detailValue}>
                  {selectedReport.durationMs ? `${(selectedReport.durationMs / 1000).toFixed(1)}s` : '-'}
                </span>
              </div>

              {selectedReport.fileSize && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>File Size:</span>
                  <span className={styles.detailValue}>{formatFileSize(selectedReport.fileSize)}</span>
                </div>
              )}
            </div>

            {selectedReport.parameters && Object.keys(selectedReport.parameters).length > 0 && (
              <div className={styles.parametersSection}>
                <h4>Parameters</h4>
                <div className={styles.parameters}>
                  {Object.entries(selectedReport.parameters).map(([key, value]) => (
                    <div key={key} className={styles.parameter}>
                      <span className={styles.paramKey}>{key}:</span>
                      <span className={styles.paramValue}>{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedReport.status === 'completed' && selectedReport.filePath && (
              <div className={styles.detailActions}>
                <Button
                  variant="primary"
                  onClick={() => handleDownload(selectedReport.reportId)}
                  icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  }
                >
                  Download Report
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReportHistory;