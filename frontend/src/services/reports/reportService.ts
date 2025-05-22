/**
 * Report service
 * Handles report generation and management API operations
 */
import apiClient from '../api/client';
import { endpoints } from '../api/endpoints';
import {
  ReportRequest,
  ReportResponse,
  ComparisonReportRequest,
  ScheduleReportRequest,
  ScheduleReportResponse,
  ReportHistoryResponse,
  ReportTemplateRequest,
  ReportTemplateResponse,
  ReportType,
  ReportFormat,
  ReportFrequency,
} from '../../types/reports';

/**
 * Report Service class
 */
class ReportService {
  /**
   * Generate a portfolio report
   */
  async generateReport(request: ReportRequest): Promise<ReportResponse> {
    try {
      const response = await apiClient.post<ReportResponse>(
        endpoints.report.generate(),
        request
      );
      return response;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  /**
   * Generate a comparison report
   */
  async generateComparisonReport(request: ComparisonReportRequest): Promise<ReportResponse> {
    try {
      const response = await apiClient.post<ReportResponse>(
        endpoints.report.compare(),
        request
      );
      return response;
    } catch (error) {
      console.error('Error generating comparison report:', error);
      throw error;
    }
  }

  /**
   * Schedule a report
   */
  async scheduleReport(request: ScheduleReportRequest): Promise<ScheduleReportResponse> {
    try {
      const response = await apiClient.post<ScheduleReportResponse>(
        endpoints.report.schedule(),
        request
      );
      return response;
    } catch (error) {
      console.error('Error scheduling report:', error);
      throw error;
    }
  }

  /**
   * Get scheduled reports
   */
  async getScheduledReports(): Promise<ScheduleReportResponse[]> {
    try {
      const response = await apiClient.get<ScheduleReportResponse[]>(
        endpoints.report.scheduled()
      );
      return response;
    } catch (error) {
      console.error('Error fetching scheduled reports:', error);
      throw error;
    }
  }

  /**
   * Cancel scheduled report
   */
  async cancelScheduledReport(reportId: string): Promise<void> {
    try {
      await apiClient.delete(endpoints.report.cancelScheduled(reportId));
    } catch (error) {
      console.error(`Error cancelling scheduled report ${reportId}:`, error);
      throw error;
    }
  }

  /**
   * Get report history
   */
  async getReportHistory(
    portfolioId?: string,
    reportType?: string,
    startDate?: string,
    endDate?: string
  ): Promise<ReportHistoryResponse[]> {
    try {
      const params = new URLSearchParams();
      if (portfolioId) params.append('portfolio_id', portfolioId);
      if (reportType) params.append('report_type', reportType);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const url = params.toString()
        ? `${endpoints.report.history()}?${params.toString()}`
        : endpoints.report.history();

      const response = await apiClient.get<ReportHistoryResponse[]>(url);
      return response;
    } catch (error) {
      console.error('Error fetching report history:', error);
      throw error;
    }
  }

  /**
   * Get report templates
   */
  async getReportTemplates(): Promise<ReportTemplateResponse[]> {
    try {
      const response = await apiClient.get<ReportTemplateResponse[]>(
        endpoints.report.templates()
      );
      return response;
    } catch (error) {
      console.error('Error fetching report templates:', error);
      throw error;
    }
  }

  /**
   * Create report template
   */
  async createReportTemplate(request: ReportTemplateRequest): Promise<ReportTemplateResponse> {
    try {
      const response = await apiClient.post<ReportTemplateResponse>(
        endpoints.report.templates(),
        request
      );
      return response;
    } catch (error) {
      console.error('Error creating report template:', error);
      throw error;
    }
  }

  /**
   * Download report
   */
  async downloadReport(reportId: string): Promise<void> {
    try {
      await apiClient.downloadFile(
        endpoints.report.download(reportId),
        `report_${reportId}`
      );
    } catch (error) {
      console.error(`Error downloading report ${reportId}:`, error);
      throw error;
    }
  }

  /**
   * Validate report request
   */
  validateReportRequest(request: ReportRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!request.portfolioId?.trim()) {
      errors.push('Portfolio ID is required');
    }

    if (!request.reportType?.trim()) {
      errors.push('Report type is required');
    }

    if (!request.format?.trim()) {
      errors.push('Report format is required');
    }

    // Validate report type
    const validReportTypes: ReportType[] = [
      'performance', 'risk', 'optimization', 'scenario',
      'historical', 'comparison', 'comprehensive', 'custom'
    ];
    if (request.reportType && !validReportTypes.includes(request.reportType as ReportType)) {
      errors.push(`Invalid report type. Must be one of: ${validReportTypes.join(', ')}`);
    }

    // Validate format
    const validFormats: ReportFormat[] = ['pdf', 'html', 'excel', 'json', 'csv'];
    if (request.format && !validFormats.includes(request.format as ReportFormat)) {
      errors.push(`Invalid format. Must be one of: ${validFormats.join(', ')}`);
    }

    // Validate dates if provided
    if (request.startDate && request.endDate) {
      const startDate = new Date(request.startDate);
      const endDate = new Date(request.endDate);

      if (isNaN(startDate.getTime())) {
        errors.push('Start date is invalid');
      }

      if (isNaN(endDate.getTime())) {
        errors.push('End date is invalid');
      }

      if (startDate >= endDate) {
        errors.push('Start date must be before end date');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate schedule report request
   */
  validateScheduleReportRequest(request: ScheduleReportRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!request.portfolioId?.trim()) {
      errors.push('Portfolio ID is required');
    }

    if (!request.reportType?.trim()) {
      errors.push('Report type is required');
    }

    if (!request.frequency?.trim()) {
      errors.push('Frequency is required');
    }

    // Validate frequency
    const validFrequencies: ReportFrequency[] = ['daily', 'weekly', 'monthly', 'quarterly', 'annual', 'once'];
    if (request.frequency && !validFrequencies.includes(request.frequency as ReportFrequency)) {
      errors.push(`Invalid frequency. Must be one of: ${validFrequencies.join(', ')}`);
    }

    // Validate email if provided
    if (request.email && !this.isValidEmail(request.email)) {
      errors.push('Invalid email address');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get available report types
   */
  getAvailableReportTypes(): Array<{ value: ReportType; label: string; description: string }> {
    return [
      {
        value: 'performance',
        label: 'Performance Report',
        description: 'Detailed analysis of portfolio performance metrics'
      },
      {
        value: 'risk',
        label: 'Risk Report',
        description: 'Comprehensive risk analysis and stress testing'
      },
      {
        value: 'optimization',
        label: 'Optimization Report',
        description: 'Portfolio optimization analysis and recommendations'
      },
      {
        value: 'scenario',
        label: 'Scenario Analysis Report',
        description: 'Analysis of portfolio performance under various scenarios'
      },
      {
        value: 'historical',
        label: 'Historical Analysis Report',
        description: 'Historical context and analogies analysis'
      },
      {
        value: 'comparison',
        label: 'Portfolio Comparison Report',
        description: 'Comparative analysis of multiple portfolios'
      },
      {
        value: 'comprehensive',
        label: 'Comprehensive Report',
        description: 'Complete analysis including all aspects'
      },
      {
        value: 'custom',
        label: 'Custom Report',
        description: 'Customizable report with selected sections'
      }
    ];
  }

  /**
   * Get available report formats
   */
  getAvailableReportFormats(): Array<{ value: ReportFormat; label: string; description: string }> {
    return [
      {
        value: 'pdf',
        label: 'PDF',
        description: 'Portable Document Format for printing and sharing'
      },
      {
        value: 'html',
        label: 'HTML',
        description: 'Interactive web-based report'
      },
      {
        value: 'excel',
        label: 'Excel',
        description: 'Microsoft Excel spreadsheet with data and charts'
      },
      {
        value: 'json',
        label: 'JSON',
        description: 'Structured data format for programmatic access'
      },
      {
        value: 'csv',
        label: 'CSV',
        description: 'Comma-separated values for data analysis'
      }
    ];
  }

  /**
   * Get available report frequencies
   */
  getAvailableReportFrequencies(): Array<{ value: ReportFrequency; label: string; description: string }> {
    return [
      {
        value: 'daily',
        label: 'Daily',
        description: 'Generate report every day'
      },
      {
        value: 'weekly',
        label: 'Weekly',
        description: 'Generate report every week'
      },
      {
        value: 'monthly',
        label: 'Monthly',
        description: 'Generate report every month'
      },
      {
        value: 'quarterly',
        label: 'Quarterly',
        description: 'Generate report every quarter'
      },
      {
        value: 'annual',
        label: 'Annual',
        description: 'Generate report every year'
      },
      {
        value: 'once',
        label: 'One-time',
        description: 'Generate report once at scheduled time'
      }
    ];
  }

  /**
   * Get default report sections for each type
   */
  getDefaultReportSections(reportType: ReportType): string[] {
    const sectionMap: Record<ReportType, string[]> = {
      'performance': [
        'executive_summary',
        'performance_overview',
        'return_analysis',
        'benchmark_comparison',
        'period_returns',
        'cumulative_performance'
      ],
      'risk': [
        'executive_summary',
        'risk_overview',
        'volatility_analysis',
        'drawdown_analysis',
        'var_analysis',
        'stress_testing',
        'risk_contribution'
      ],
      'optimization': [
        'executive_summary',
        'current_allocation',
        'optimization_results',
        'efficient_frontier',
        'risk_return_analysis',
        'recommendations'
      ],
      'scenario': [
        'executive_summary',
        'scenario_overview',
        'impact_analysis',
        'vulnerability_assessment',
        'resilience_analysis',
        'recommendations'
      ],
      'historical': [
        'executive_summary',
        'historical_context',
        'analogies_analysis',
        'lessons_learned',
        'current_parallels',
        'implications'
      ],
      'comparison': [
        'executive_summary',
        'portfolio_overview',
        'composition_comparison',
        'performance_comparison',
        'risk_comparison',
        'recommendations'
      ],
      'comprehensive': [
        'executive_summary',
        'portfolio_overview',
        'performance_analysis',
        'risk_analysis',
        'optimization_analysis',
        'scenario_analysis',
        'recommendations',
        'appendix'
      ],
      'custom': []
    };

    return sectionMap[reportType] || [];
  }

  /**
   * Format report history for display
   */
  formatReportHistory(reports: ReportHistoryResponse[]): Array<{
    id: string;
    name: string;
    type: string;
    format: string;
    status: string;
    createdAt: string;
    fileSize: string;
    duration: string;
  }> {
    return reports.map(report => ({
      id: report.reportId,
      name: `${report.reportType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Report`,
      type: report.reportType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      format: report.format.toUpperCase(),
      status: report.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      createdAt: new Date(report.generatedAt).toLocaleDateString(),
      fileSize: report.fileSize ? this.formatFileSize(report.fileSize) : 'Unknown',
      duration: report.durationMs ? this.formatDuration(report.durationMs) : 'Unknown'
    }));
  }

  /**
   * Check if email is valid
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Format file size
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Format duration
   */
  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  }

  /**
   * Generate report preview data
   */
  generateReportPreview(request: ReportRequest): {
    title: string;
    sections: Array<{ name: string; description: string; included: boolean }>;
    estimatedPages: number;
    estimatedSize: string;
  } {
    const reportTypeLabels: Record<ReportType, string> = {
      'performance': 'Performance Analysis Report',
      'risk': 'Risk Assessment Report',
      'optimization': 'Portfolio Optimization Report',
      'scenario': 'Scenario Analysis Report',
      'historical': 'Historical Analysis Report',
      'comparison': 'Portfolio Comparison Report',
      'comprehensive': 'Comprehensive Portfolio Report',
      'custom': 'Custom Portfolio Report'
    };

    const title = reportTypeLabels[request.reportType as ReportType] || 'Portfolio Report';
    const defaultSections = this.getDefaultReportSections(request.reportType as ReportType);
    const requestedSections = request.sections || defaultSections;

    const allSections = [
      { name: 'executive_summary', description: 'Executive Summary', pages: 1 },
      { name: 'portfolio_overview', description: 'Portfolio Overview', pages: 2 },
      { name: 'performance_analysis', description: 'Performance Analysis', pages: 3 },
      { name: 'risk_analysis', description: 'Risk Analysis', pages: 4 },
      { name: 'optimization_analysis', description: 'Optimization Analysis', pages: 3 },
      { name: 'scenario_analysis', description: 'Scenario Analysis', pages: 3 },
      { name: 'historical_context', description: 'Historical Context', pages: 2 },
      { name: 'comparison_analysis', description: 'Comparison Analysis', pages: 3 },
      { name: 'recommendations', description: 'Recommendations', pages: 2 },
      { name: 'appendix', description: 'Appendix', pages: 2 }
    ];

    const sections = allSections.map(section => ({
      name: section.description,
      description: `Detailed ${section.description.toLowerCase()} with charts and metrics`,
      included: requestedSections.includes(section.name)
    }));

    const estimatedPages = allSections
      .filter(section => requestedSections.includes(section.name))
      .reduce((total, section) => total + section.pages, 0);

    const estimatedSize = request.format === 'pdf'
      ? `${Math.round(estimatedPages * 0.5)} MB`
      : request.format === 'excel'
      ? `${Math.round(estimatedPages * 0.3)} MB`
      : `${Math.round(estimatedPages * 0.1)} MB`;

    return {
      title,
      sections,
      estimatedPages,
      estimatedSize
    };
  }
}

// Export singleton instance
export const reportService = new ReportService();
export default reportService;