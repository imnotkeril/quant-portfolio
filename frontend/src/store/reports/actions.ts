/**
 * Reports actions
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { reportService } from '../../services/reports/reportService';
import {
  ReportRequest,
  ComparisonReportRequest,
  ScheduleReportRequest,
  ReportTemplateRequest,
  ReportResponse,
  ScheduleReportResponse,
  ReportHistoryResponse,
  ReportTemplateResponse,
} from '../../types/reports';

/**
 * Generate report
 */
export const generateReport = createAsyncThunk<
  ReportResponse,
  ReportRequest,
  { rejectValue: string }
>(
  'reports/generateReport',
  async (request, { rejectWithValue }) => {
    try {
      const report = await reportService.generateReport(request);
      return report;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to generate report');
    }
  }
);

/**
 * Generate comparison report
 */
export const generateComparisonReport = createAsyncThunk<
  ReportResponse,
  ComparisonReportRequest,
  { rejectValue: string }
>(
  'reports/generateComparisonReport',
  async (request, { rejectWithValue }) => {
    try {
      const report = await reportService.generateComparisonReport(request);
      return report;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to generate comparison report');
    }
  }
);

/**
 * Schedule report
 */
export const scheduleReport = createAsyncThunk<
  ScheduleReportResponse,
  ScheduleReportRequest,
  { rejectValue: string }
>(
  'reports/scheduleReport',
  async (request, { rejectWithValue }) => {
    try {
      const scheduledReport = await reportService.scheduleReport(request);
      return scheduledReport;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to schedule report');
    }
  }
);

/**
 * Load scheduled reports
 */
export const loadScheduledReports = createAsyncThunk<
  ScheduleReportResponse[],
  void,
  { rejectValue: string }
>(
  'reports/loadScheduledReports',
  async (_, { rejectWithValue }) => {
    try {
      const scheduledReports = await reportService.getScheduledReports();
      return scheduledReports;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load scheduled reports');
    }
  }
);

/**
 * Cancel scheduled report
 */
export const cancelScheduledReport = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'reports/cancelScheduledReport',
  async (reportId, { rejectWithValue }) => {
    try {
      await reportService.cancelScheduledReport(reportId);
      return reportId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to cancel scheduled report');
    }
  }
);

/**
 * Load report history
 */
export const loadReportHistory = createAsyncThunk<
  ReportHistoryResponse[],
  {
    portfolioId?: string;
    reportType?: string;
    startDate?: string;
    endDate?: string;
  },
  { rejectValue: string }
>(
  'reports/loadReportHistory',
  async (filters, { rejectWithValue }) => {
    try {
      const history = await reportService.getReportHistory(
        filters.portfolioId,
        filters.reportType,
        filters.startDate,
        filters.endDate
      );
      return history;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load report history');
    }
  }
);

/**
 * Load report templates
 */
export const loadReportTemplates = createAsyncThunk<
  ReportTemplateResponse[],
  void,
  { rejectValue: string }
>(
  'reports/loadReportTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const templates = await reportService.getReportTemplates();
      return templates;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load report templates');
    }
  }
);

/**
 * Create report template
 */
export const createReportTemplate = createAsyncThunk<
  ReportTemplateResponse,
  ReportTemplateRequest,
  { rejectValue: string }
>(
  'reports/createReportTemplate',
  async (request, { rejectWithValue }) => {
    try {
      const template = await reportService.createReportTemplate(request);
      return template;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create report template');
    }
  }
);

/**
 * Download report
 */
export const downloadReport = createAsyncThunk<
  void,
  string,
  { rejectValue: string }
>(
  'reports/downloadReport',
  async (reportId, { rejectWithValue }) => {
    try {
      await reportService.downloadReport(reportId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to download report');
    }
  }
);