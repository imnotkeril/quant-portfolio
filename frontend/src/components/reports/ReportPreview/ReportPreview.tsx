/**
 * ReportPreview Component
 * Preview generated reports before download
 */
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Card from '../../common/Card/Card';
import { Button } from '../../common/Button/Button';
import { Modal } from '../../common/Modal/Modal';
import Tabs from '../../common/Tabs/Tabs';
import { LineChart } from '../../charts/LineChart/LineChart';
import { PieChart } from '../../charts/PieChart/PieChart';
import { BarChart } from '../../charts/BarChart/BarChart';
import { Table } from '../../common/Table/Table';
import {
  selectReportPreview,
  selectIsPreviewVisible,
  selectCurrentReport
} from '../../../store/reports/selectors';
import { downloadReport } from '../../../store/reports/actions';
import { formatCurrency, formatPercentage, formatDate } from '../../../utils/formatters';
import styles from './ReportPreview.module.css';

interface ReportPreviewProps {
  className?: string;
  'data-testid'?: string;
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({
  className,
  'data-testid': testId,
}) => {
  const dispatch = useDispatch();
  const preview = useSelector(selectReportPreview);
  const isVisible = useSelector(selectIsPreviewVisible);
  const currentReport = useSelector(selectCurrentReport);

  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isVisible) {
      setActiveTab('overview');
    }
  }, [isVisible]);

  const handleClose = () => {
    // Close preview by setting local state or calling onClose prop
    // dispatch(hideReportPreview()); // This action doesn't exist
  };

  const handleDownload = () => {
    if (currentReport?.reportId) {
      dispatch(downloadReport(currentReport.reportId) as any);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isVisible || !preview.data) {
    return null;
  }

  const reportData = preview.data;

  // Sample data for preview
  const performanceData = [
    { name: 'Jan', portfolio: 4000, benchmark: 3800 },
    { name: 'Feb', portfolio: 3000, benchmark: 3200 },
    { name: 'Mar', portfolio: 5000, benchmark: 4500 },
    { name: 'Apr', portfolio: 4500, benchmark: 4200 },
    { name: 'May', portfolio: 6000, benchmark: 5500 },
    { name: 'Jun', portfolio: 8000, benchmark: 7200 },
  ];

  const allocationData = [
    { name: 'Stocks', value: 60 },
    { name: 'Bonds', value: 25 },
    { name: 'Real Estate', value: 10 },
    { name: 'Cash', value: 5 },
  ];

  const metricsData = [
    { name: 'Total Return', value: '24.5%', benchmark: '18.2%', status: 'positive' },
    { name: 'Sharpe Ratio', value: '1.45', benchmark: '1.12', status: 'positive' },
    { name: 'Volatility', value: '12.3%', benchmark: '14.8%', status: 'positive' },
    { name: 'Max Drawdown', value: '-8.2%', benchmark: '-12.1%', status: 'positive' },
    { name: 'Alpha', value: '3.2%', benchmark: '0.0%', status: 'positive' },
    { name: 'Beta', value: '0.85', benchmark: '1.00', status: 'neutral' },
  ];

  const holdingsData = [
    { symbol: 'AAPL', name: 'Apple Inc.', weight: 8.5, value: 85000, return: 12.4 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', weight: 7.2, value: 72000, return: 15.8 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', weight: 6.8, value: 68000, return: 9.2 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', weight: 5.4, value: 54000, return: -2.1 },
    { symbol: 'TSLA', name: 'Tesla Inc.', weight: 4.1, value: 41000, return: 28.7 },
  ];

  const metricsColumns = [
    {
      key: 'name',
      title: 'Metric',
      width: '30%',
      render: (_: any, record: any) => record.name,
    },
    {
      key: 'value',
      title: 'Portfolio',
      width: '25%',
      render: (_: any, record: any) => (
        <span className={styles[record.status]}>{record.value}</span>
      ),
    },
    {
      key: 'benchmark',
      title: 'Benchmark',
      width: '25%',
      render: (_: any, record: any) => record.benchmark,
    },
    {
      key: 'difference',
      title: 'Difference',
      width: '20%',
      render: (_: any, record: any) => {
        const portfolioValue = parseFloat(record.value.replace('%', ''));
        const benchmarkValue = parseFloat(record.benchmark.replace('%', ''));
        const diff = portfolioValue - benchmarkValue;
        const sign = diff >= 0 ? '+' : '';
        return (
          <span className={diff >= 0 ? styles.positive : styles.negative}>
            {sign}{diff.toFixed(1)}%
          </span>
        );
      },
    },
  ] as any;

  const holdingsColumns = [
    {
      key: 'symbol',
      title: 'Symbol',
      width: '15%',
      render: (_: any, record: any) => record.symbol,
    },
    {
      key: 'name',
      title: 'Name',
      width: '35%',
      render: (_: any, record: any) => record.name,
    },
    {
      key: 'weight',
      title: 'Weight',
      width: '15%',
      render: (_: any, record: any) => `${record.weight.toFixed(1)}%`,
    },
    {
      key: 'value',
      title: 'Value',
      width: '20%',
      render: (_: any, record: any) => formatCurrency(record.value),
    },
    {
      key: 'return',
      title: 'Return',
      width: '15%',
      render: (_: any, record: any) => (
        <span className={record.return >= 0 ? styles.positive : styles.negative}>
          {formatPercentage(record.return / 100)}
        </span>
      ),
    },
  ] as any;

  const tabs = [
    {
      key: 'overview',
      label: 'Overview',
      content: (
        <div className={styles.tabContent}>
          <Card title="Top Holdings" className={styles.holdingsCard}>
            <Table
              columns={holdingsColumns}
              data={holdingsData}
              rowKey={(record) => record.symbol}
              pagination={false}
              size="middle"
            />
          </Card>
        </div>
      ),
    },
    {
      key: 'charts',
      label: 'Charts',
      content: (
        <div className={styles.tabContent}>
          <div className={styles.chartsGrid}>
            <Card title="Monthly Returns" className={styles.chartCard}>
              <BarChart
                data={performanceData.map(item => ({
                  name: item.name,
                  portfolio: ((item.portfolio - 4000) / 4000) * 100,
                  benchmark: ((item.benchmark - 4000) / 4000) * 100,
                }))}
                series={[
                  { key: 'portfolio', name: 'Portfolio', color: '#BF9FFB' },
                  { key: 'benchmark', name: 'Benchmark', color: '#90BFF9' },
                ]}
                height={300}
                showGrid={true}
                showLegend={true}
              />
            </Card>

            <Card title="Risk Metrics" className={styles.chartCard}>
              <BarChart
                data={[
                  { name: 'Volatility', portfolio: 12.3, benchmark: 14.8 },
                  { name: 'VaR (95%)', portfolio: 8.2, benchmark: 10.5 },
                  { name: 'Max Drawdown', portfolio: 8.2, benchmark: 12.1 },
                  { name: 'Beta', portfolio: 0.85, benchmark: 1.0 },
                ]}
                series={[
                  { key: 'portfolio', name: 'Portfolio', color: '#BF9FFB' },
                  { key: 'benchmark', name: 'Benchmark', color: '#90BFF9' },
                ]}
                height={300}
                showGrid={true}
                showLegend={true}
              />
            </Card>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Modal
      isOpen={isVisible}
      onClose={handleClose}
      title="Report Preview"
      size="xlarge"
      data-testid={testId}
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.reportInfo}>
            <h3 className={styles.reportTitle}>
              {reportData.title || `${reportData.reportType} Report`}
            </h3>
            <div className={styles.reportMeta}>
              <span>Portfolio: {reportData.portfolioName}</span>
              <span>•</span>
              <span>Generated: {formatDate(new Date().toISOString())}</span>
              <span>•</span>
              <span>Format: {reportData.format?.toUpperCase()}</span>
            </div>
          </div>

          <div className={styles.headerActions}>
            <Button
              variant="outline"
              onClick={handlePrint}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6,9 6,2 18,2 18,9"/>
                  <path d="M6,18H4a2,2,0,0,1-2-2V11a2,2,0,0,1,2-2H20a2,2,0,0,1,2,2v5a2,2,0,0,1-2,2H18"/>
                  <polyline points="6,14 18,14 18,22 6,22 6,14"/>
                </svg>
              }
            >
              Print
            </Button>

            <Button
              variant="primary"
              onClick={handleDownload}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              }
            >
              Download
            </Button>
          </div>
        </div>

        <div className={styles.content}>
          <Tabs
            items={tabs}
            activeKey={activeTab}
            onChange={setActiveTab}
            className={styles.tabs}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ReportPreview;