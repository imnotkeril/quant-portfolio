/**
 * Reports actions
 */
import {
  ReportRequest,
  ComparisonReportRequest,
  ScheduleReportRequest,
  ReportTemplateRequest,
  ReportType,
} from '../../types/reports';

// Action Types
export const REPORTS_ACTION_TYPES = {
  // Generate report actions
  GENERATE_REPORT_REQUEST: 'GENERATE_REPORT_REQUEST',
  GENERATE_REPORT_SUCCESS: 'GENERATE_REPORT_SUCCESS',
  GENERATE_REPORT_FAILURE: 'GENERATE_REPORT_FAILURE',

  // Generate comparison report actions
  GENERATE_COMPARISON_REPORT_REQUEST: 'GENERATE_COMPARISON_REPORT_REQUEST',
  GENERATE_COMPARISON_REPORT_SUCCESS: 'GENERATE_COMPARISON_REPORT_SUCCESS',
  GENERATE_COMPARISON_REPORT_FAILURE: 'GENERATE_COMPARISON_REPORT_FAILURE',

  // Schedule report actions
  SCHEDULE_REPORT_REQUEST: 'SCHEDULE_REPORT_REQUEST',
  SCHEDULE_REPORT_SUCCESS: 'SCHEDULE_REPORT_SUCCESS',
  SCHEDULE_REPORT_FAILURE: 'SCHEDULE_REPORT_FAILURE',

  // Scheduled reports actions
  LOAD_SCHEDULED_REPORTS_REQUEST: 'LOAD_SCHEDULED_REPORTS_REQUEST',
  LOAD_SCHEDULED_REPORTS_SUCCESS: 'LOAD_SCHEDULED_REPORTS_SUCCESS',
  LOAD_SCHEDULED_REPORTS_FAILURE: 'LOAD_SCHEDULED_REPORTS_FAILURE',

  // Cancel scheduled report actions
  CANCEL_SCHEDULED_REPORT_REQUEST: 'CANCEL_SCHEDULED_REPORT_REQUEST',
  CANCEL_SCHEDULED_REPORT_SUCCESS: 'CANCEL_SCHEDULED_REPORT_SUCCESS',
  CANCEL_SCHEDULED_REPORT_FAILURE: 'CANCEL_SCHEDULED_REPORT_FAILURE',

  // Report history actions
  LOAD_REPORT_HISTORY_REQUEST: 'LOAD_REPORT_HISTORY_REQUEST',
  LOAD_REPORT_HISTORY_SUCCESS: 'LOAD_REPORT_HISTORY_SUCCESS',
  LOAD_REPORT_HISTORY_FAILURE: 'LOAD_REPORT_HISTORY_FAILURE',

  // Report templates actions
  LOAD_REPORT_TEMPLATES_REQUEST: 'LOAD_REPORT_TEMPLATES_REQUEST',
  LOAD_REPORT_TEMPLATES_SUCCESS: 'LOAD_REPORT_TEMPLATES_SUCCESS',
  LOAD_REPORT_TEMPLATES_FAILURE: 'LOAD_REPORT_TEMPLATES_FAILURE',

  // Create template actions
  CREATE_REPORT_TEMPLATE_REQUEST: 'CREATE_REPORT_TEMPLATE_REQUEST',
  CREATE_REPORT_TEMPLATE_SUCCESS: 'CREATE_REPORT_TEMPLATE_SUCCESS',
  CREATE_REPORT_TEMPLATE_FAILURE: 'CREATE_REPORT_TEMPLATE_FAILURE',

  // Download report actions
  DOWNLOAD_REPORT_REQUEST: 'DOWNLOAD_REPORT_REQUEST',
  DOWNLOAD_REPORT_SUCCESS: 'DOWNLOAD_REPORT_SUCCESS',
  DOWNLOAD_REPORT_FAILURE: 'DOWNLOAD_REPORT_FAILURE',

  // Preview actions
  SHOW_REPORT_PREVIEW: 'SHOW_REPORT_PREVIEW',
  HIDE_REPORT_PREVIEW: 'HIDE_REPORT_PREVIEW',

  // UI actions
  SET_CURRENT_REPORT: 'SET_CURRENT_REPORT',
  CLEAR_REPORT_ERRORS: 'CLEAR_REPORT_ERRORS',
  SET_HISTORY_FILTERS: 'SET_HISTORY_FILTERS',
  CLEAR_HISTORY_FILTERS: 'CLEAR_HISTORY_FILTERS',
} as const;

// Action Creators

// Generate report actions
export const generateReportRequest = (request: ReportRequest) => ({
  type: REPORTS_ACTION_TYPES.GENERATE_REPORT_REQUEST,
  payload: request,
});

export const generateReportSuccess = (report: any) => ({
  type: REPORTS_ACTION_TYPES.GENERATE_REPORT_SUCCESS,
  payload: report,
});

export const generateReportFailure = (error: string) => ({
  type: REPORTS_ACTION_TYPES.GENERATE_REPORT_FAILURE,
  payload: error,
});

// Generate comparison report actions
export const generateComparisonReportRequest = (request: ComparisonReportRequest) => ({
  type: REPORTS_ACTION_TYPES.GENERATE_COMPARISON_REPORT_REQUEST,
  payload: request,
});

export const generateComparisonReportSuccess = (report: any) => ({
  type: REPORTS_ACTION_TYPES.GENERATE_COMPARISON_REPORT_SUCCESS,
  payload: report,
});

export const generateComparisonReportFailure = (error: string) => ({
  type: REPORTS_ACTION_TYPES.GENERATE_COMPARISON_REPORT_FAILURE,
  payload: error,
});

// Schedule report actions
export const scheduleReportRequest = (request: ScheduleReportRequest) => ({
  type: REPORTS_ACTION_TYPES.SCHEDULE_REPORT_REQUEST,
  payload: request,
});

export const scheduleReportSuccess = (scheduledReport: any) => ({
  type: REPORTS_ACTION_TYPES.SCHEDULE_REPORT_SUCCESS,
  payload: scheduledReport,
});

export const scheduleReportFailure = (error: string) => ({
  type: REPORTS_ACTION_TYPES.SCHEDULE_REPORT_FAILURE,
  payload: error,
});

// Scheduled reports actions
export const loadScheduledReportsRequest = () => ({
  type: REPORTS_ACTION_TYPES.LOAD_SCHEDULED_REPORTS_REQUEST,
});

export const loadScheduledReportsSuccess = (scheduledReports: any[]) => ({
  type: REPORTS_ACTION_TYPES.LOAD_SCHEDULED_REPORTS_SUCCESS,
  payload: scheduledReports,
});

export const loadScheduledReportsFailure = (error: string) => ({
  type: REPORTS_ACTION_TYPES.LOAD_SCHEDULED_REPORTS_FAILURE,
  payload: error,
});

// Cancel scheduled report actions
export const cancelScheduledReportRequest = (reportId: string) => ({
  type: REPORTS_ACTION_TYPES.CANCEL_SCHEDULED_REPORT_REQUEST,
  payload: reportId,
});

export const cancelScheduledReportSuccess = (reportId: string) => ({
  type: REPORTS_ACTION_TYPES.CANCEL_SCHEDULED_REPORT_SUCCESS,
  payload: reportId,
});

export const cancelScheduledReportFailure = (error: string) => ({
  type: REPORTS_ACTION_TYPES.CANCEL_SCHEDULED_REPORT_FAILURE,
  payload: error,
});

// Report history actions
export const loadReportHistoryRequest = (filters?: {
  portfolioId?: string;
  reportType?: string;
  startDate?: string;
  endDate?: string;
}) => ({
  type: REPORTS_ACTION_TYPES.LOAD_REPORT_HISTORY_REQUEST,
  payload: filters,
});

export const loadReportHistorySuccess = (history: any[]) => ({
  type: REPORTS_ACTION_TYPES.LOAD_REPORT_HISTORY_SUCCESS,
  payload: history,
});

export const loadReportHistoryFailure = (error: string) => ({
  type: REPORTS_ACTION_TYPES.LOAD_REPORT_HISTORY_FAILURE,
  payload: error,
});

// Report templates actions
export const loadReportTemplatesRequest = () => ({
  type: REPORTS_ACTION_TYPES.LOAD_REPORT_TEMPLATES_REQUEST,
});

export const loadReportTemplatesSuccess = (templates: any[]) => ({
  type: REPORTS_ACTION_TYPES.LOAD_REPORT_TEMPLATES_SUCCESS,
  payload: templates,
});

export const loadReportTemplatesFailure = (error: string) => ({
  type: REPORTS_ACTION_TYPES.LOAD_REPORT_TEMPLATES_FAILURE,
  payload: error,
});

// Create template actions
export const createReportTemplateRequest = (request: ReportTemplateRequest) => ({
  type: REPORTS_ACTION_TYPES.CREATE_REPORT_TEMPLATE_REQUEST,
  payload: request,
});

export const createReportTemplateSuccess = (template: any) => ({
  type: REPORTS_ACTION_TYPES.CREATE_REPORT_TEMPLATE_SUCCESS,
  payload: template,
});

export const createReportTemplateFailure = (error: string) => ({
  type: REPORTS_ACTION_TYPES.CREATE_REPORT_TEMPLATE_FAILURE,
  payload: error,
});

// Download report actions
export const downloadReportRequest = (reportId: string) => ({
  type: REPORTS_ACTION_TYPES.DOWNLOAD_REPORT_REQUEST,
  payload: reportId,
});

export const downloadReportSuccess = (reportId: string) => ({
  type: REPORTS_ACTION_TYPES.DOWNLOAD_REPORT_SUCCESS,
  payload: reportId,
});

export const downloadReportFailure = (error: string) => ({
  type: REPORTS_ACTION_TYPES.DOWNLOAD_REPORT_FAILURE,
  payload: error,
});

// Preview actions
export const showReportPreview = (data: any) => ({
  type: REPORTS_ACTION_TYPES.SHOW_REPORT_PREVIEW,
  payload: data,
});

export const hideReportPreview = () => ({
  type: REPORTS_ACTION_TYPES.HIDE_REPORT_PREVIEW,
});

// UI actions
export const setCurrentReport = (report: any) => ({
  type: REPORTS_ACTION_TYPES.SET_CURRENT_REPORT,
  payload: report,
});

export const clearReportErrors = () => ({
  type: REPORTS_ACTION_TYPES.CLEAR_REPORT_ERRORS,
});

export const setHistoryFilters = (filters: {
  portfolioId?: string;
  reportType?: ReportType;
  startDate?: string;
  endDate?: string;
}) => ({
  type: REPORTS_ACTION_TYPES.SET_HISTORY_FILTERS,
  payload: filters,
});

export const clearHistoryFilters = () => ({
  type: REPORTS_ACTION_TYPES.CLEAR_HISTORY_FILTERS,
});

// Action types
export type ReportsAction =
  | ReturnType<typeof generateReportRequest>
  | ReturnType<typeof generateReportSuccess>
  | ReturnType<typeof generateReportFailure>
  | ReturnType<typeof generateComparisonReportRequest>
  | ReturnType<typeof generateComparisonReportSuccess>
  | ReturnType<typeof generateComparisonReportFailure>
  | ReturnType<typeof scheduleReportRequest>
  | ReturnType<typeof scheduleReportSuccess>
  | ReturnType<typeof scheduleReportFailure>
  | ReturnType<typeof loadScheduledReportsRequest>
  | ReturnType<typeof loadScheduledReportsSuccess>
  | ReturnType<typeof loadScheduledReportsFailure>
  | ReturnType<typeof cancelScheduledReportRequest>
  | ReturnType<typeof cancelScheduledReportSuccess>
  | ReturnType<typeof cancelScheduledReportFailure>
  | ReturnType<typeof loadReportHistoryRequest>
  | ReturnType<typeof loadReportHistorySuccess>
  | ReturnType<typeof loadReportHistoryFailure>
  | ReturnType<typeof loadReportTemplatesRequest>
  | ReturnType<typeof loadReportTemplatesSuccess>
  | ReturnType<typeof loadReportTemplatesFailure>
  | ReturnType<typeof createReportTemplateRequest>
  | ReturnType<typeof createReportTemplateSuccess>
  | ReturnType<typeof createReportTemplateFailure>
  | ReturnType<typeof downloadReportRequest>
  | ReturnType<typeof downloadReportSuccess>
  | ReturnType<typeof downloadReportFailure>
  | ReturnType<typeof showReportPreview>
  | ReturnType<typeof hideReportPreview>
  | ReturnType<typeof setCurrentReport>
  | ReturnType<typeof clearReportErrors>
  | ReturnType<typeof setHistoryFilters>
  | ReturnType<typeof clearHistoryFilters>;