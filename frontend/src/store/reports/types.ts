/**
 * Reports state types
 */
import {
  ReportType,
  ReportFormat,
  ReportFrequency,
  ReportResponse,
  ScheduleReportResponse,
  ReportHistoryResponse,
  ReportTemplateResponse,
} from '../../types/reports';

/**
 * Report state interface
 */
export interface ReportState {
  // Generated reports
  reports: ReportResponse[];
  currentReport: ReportResponse | null;

  // Scheduled reports
  scheduledReports: ScheduleReportResponse[];

  // Report history
  reportHistory: ReportHistoryResponse[];

  // Report templates
  reportTemplates: ReportTemplateResponse[];

  // UI state
  isGenerating: boolean;
  isScheduling: boolean;
  isLoadingHistory: boolean;
  isLoadingTemplates: boolean;

  // Error states
  generateError: string | null;
  scheduleError: string | null;
  historyError: string | null;
  templatesError: string | null;

  // Filters and pagination
  historyFilters: {
    portfolioId?: string;
    reportType?: ReportType;
    startDate?: string;
    endDate?: string;
  };

  // Preview state
  reportPreview: {
    isVisible: boolean;
    data: any;
  };

  // Download state
  downloadQueue: string[];
  isDownloading: boolean;
}

/**
 * Initial state
 */
export const initialReportState: ReportState = {
  reports: [],
  currentReport: null,
  scheduledReports: [],
  reportHistory: [],
  reportTemplates: [],
  isGenerating: false,
  isScheduling: false,
  isLoadingHistory: false,
  isLoadingTemplates: false,
  generateError: null,
  scheduleError: null,
  historyError: null,
  templatesError: null,
  historyFilters: {},
  reportPreview: {
    isVisible: false,
    data: null,
  },
  downloadQueue: [],
  isDownloading: false,
};