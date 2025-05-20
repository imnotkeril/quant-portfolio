import apiService from '../api/client';
import endpoints from '../api/endpoints';
import {
  ReportRequest,
  ReportResponse,
  ComparisonReportRequest,
  ScheduleReportRequest,
  ScheduleReportResponse,
  ReportHistoryResponse,
  ReportTemplateRequest,
  ReportTemplateResponse
} from '../../types/reports';

/**
 * Service for report generation
 */
const reportService = {
  /**
   * Generate portfolio report
   */
  generateReport: async (request: ReportRequest) => {
    try {
      const response = await apiService.post<ReportResponse>(
        endpoints.reports.generate,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  },

  /**
   * Generate comparison report
   */
  generateComparisonReport: async (request: ComparisonReportRequest) => {
    try {
      const response = await apiService.post<ReportResponse>(
        endpoints.reports.compare,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error generating comparison report:', error);
      throw error;
    }
  },

  /**
   * Schedule periodic report
   */
  scheduleReport: async (request: ScheduleReportRequest) => {
    try {
      const response = await apiService.post<ScheduleReportResponse>(
        endpoints.reports.schedule,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error scheduling report:', error);
      throw error;
    }
  },

  /**
   * Get list of scheduled reports
   */
  getScheduledReports: async () => {
    try {
      const response = await apiService.get<ScheduleReportResponse[]>(
        endpoints.reports.scheduled
      );
      return response.data;
    } catch (error) {
      console.error('Error getting scheduled reports:', error);
      throw error;
    }
  },

  /**
   * Cancel scheduled report
   */
  cancelScheduledReport: async (id: string) => {
    try {
      const response = await apiService.delete(
        endpoints.reports.cancelScheduled(id)
      );
      return response.data;
    } catch (error) {
      console.error(`Error canceling scheduled report ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get report generation history
   */
  getReportHistory: async (
    portfolioId?: string,
    reportType?: string,
    startDate?: string,
    endDate?: string
  ) => {
    try {
      let url = endpoints.reports.history;
      const params = new URLSearchParams();

      if (portfolioId) params.append('portfolio_id', portfolioId);
      if (reportType) params.append('report_type', reportType);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await apiService.get<ReportHistoryResponse[]>(url);
      return response.data;
    } catch (error) {
      console.error('Error getting report history:', error);
      throw error;
    }
  },

  /**
   * Get available report templates
   */
  getReportTemplates: async () => {
    try {
      const response = await apiService.get<ReportTemplateResponse[]>(
        endpoints.reports.templates
      );
      return response.data;
    } catch (error) {
      console.error('Error getting report templates:', error);
      throw error;
    }
  },

  /**
   * Create custom report template
   */
  createReportTemplate: async (request: ReportTemplateRequest) => {
    try {
      const response = await apiService.post<ReportTemplateResponse>(
        endpoints.reports.templates,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error creating report template:', error);
      throw error;
    }
  },

  /**
   * Download generated report
   */
  downloadReport: async (id: string) => {
    try {
      const response = await apiService.get<Blob>(
        endpoints.reports.download(id),
        {
          responseType: 'blob',
        }
      );

      // Create download link
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'report.pdf';

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error(`Error downloading report ${id}:`, error);
      throw error;
    }
  },
};

export default reportService;