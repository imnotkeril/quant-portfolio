/**
 * Reports reducer
 */
import { ReportState, initialReportState } from './types';
import { ReportsAction, REPORTS_ACTION_TYPES } from './actions';

export const reportsReducer = (
  state: ReportState = initialReportState,
  action: ReportsAction
): ReportState => {
  switch (action.type) {
    // Generate report cases
    case REPORTS_ACTION_TYPES.GENERATE_REPORT_REQUEST:
      return {
        ...state,
        isGenerating: true,
        generateError: null,
      };

    case REPORTS_ACTION_TYPES.GENERATE_REPORT_SUCCESS:
      return {
        ...state,
        isGenerating: false,
        reports: [action.payload, ...state.reports],
        currentReport: action.payload,
        generateError: null,
      };

    case REPORTS_ACTION_TYPES.GENERATE_REPORT_FAILURE:
      return {
        ...state,
        isGenerating: false,
        generateError: action.payload,
      };

    // Generate comparison report cases
    case REPORTS_ACTION_TYPES.GENERATE_COMPARISON_REPORT_REQUEST:
      return {
        ...state,
        isGenerating: true,
        generateError: null,
      };

    case REPORTS_ACTION_TYPES.GENERATE_COMPARISON_REPORT_SUCCESS:
      return {
        ...state,
        isGenerating: false,
        reports: [action.payload, ...state.reports],
        currentReport: action.payload,
        generateError: null,
      };

    case REPORTS_ACTION_TYPES.GENERATE_COMPARISON_REPORT_FAILURE:
      return {
        ...state,
        isGenerating: false,
        generateError: action.payload,
      };

    // Schedule report cases
    case REPORTS_ACTION_TYPES.SCHEDULE_REPORT_REQUEST:
      return {
        ...state,
        isScheduling: true,
        scheduleError: null,
      };

    case REPORTS_ACTION_TYPES.SCHEDULE_REPORT_SUCCESS:
      return {
        ...state,
        isScheduling: false,
        scheduledReports: [action.payload, ...state.scheduledReports],
        scheduleError: null,
      };

    case REPORTS_ACTION_TYPES.SCHEDULE_REPORT_FAILURE:
      return {
        ...state,
        isScheduling: false,
        scheduleError: action.payload,
      };

    // Load scheduled reports cases
    case REPORTS_ACTION_TYPES.LOAD_SCHEDULED_REPORTS_REQUEST:
      return {
        ...state,
        isLoadingHistory: true,
        scheduleError: null,
      };

    case REPORTS_ACTION_TYPES.LOAD_SCHEDULED_REPORTS_SUCCESS:
      return {
        ...state,
        isLoadingHistory: false,
        scheduledReports: action.payload,
        scheduleError: null,
      };

    case REPORTS_ACTION_TYPES.LOAD_SCHEDULED_REPORTS_FAILURE:
      return {
        ...state,
        isLoadingHistory: false,
        scheduleError: action.payload,
      };

    // Cancel scheduled report cases
    case REPORTS_ACTION_TYPES.CANCEL_SCHEDULED_REPORT_REQUEST:
      return {
        ...state,
        scheduleError: null,
      };

    case REPORTS_ACTION_TYPES.CANCEL_SCHEDULED_REPORT_SUCCESS:
      return {
        ...state,
        scheduledReports: state.scheduledReports.filter(
          report => report.reportId !== action.payload
        ),
        scheduleError: null,
      };

    case REPORTS_ACTION_TYPES.CANCEL_SCHEDULED_REPORT_FAILURE:
      return {
        ...state,
        scheduleError: action.payload,
      };

    // Load report history cases
    case REPORTS_ACTION_TYPES.LOAD_REPORT_HISTORY_REQUEST:
      return {
        ...state,
        isLoadingHistory: true,
        historyError: null,
        historyFilters: action.payload || {},
      };

    case REPORTS_ACTION_TYPES.LOAD_REPORT_HISTORY_SUCCESS:
      return {
        ...state,
        isLoadingHistory: false,
        reportHistory: action.payload,
        historyError: null,
      };

    case REPORTS_ACTION_TYPES.LOAD_REPORT_HISTORY_FAILURE:
      return {
        ...state,
        isLoadingHistory: false,
        historyError: action.payload,
      };

    // Load report templates cases
    case REPORTS_ACTION_TYPES.LOAD_REPORT_TEMPLATES_REQUEST:
      return {
        ...state,
        isLoadingTemplates: true,
        templatesError: null,
      };

    case REPORTS_ACTION_TYPES.LOAD_REPORT_TEMPLATES_SUCCESS:
      return {
        ...state,
        isLoadingTemplates: false,
        reportTemplates: action.payload,
        templatesError: null,
      };

    case REPORTS_ACTION_TYPES.LOAD_REPORT_TEMPLATES_FAILURE:
      return {
        ...state,
        isLoadingTemplates: false,
        templatesError: action.payload,
      };

    // Create report template cases
    case REPORTS_ACTION_TYPES.CREATE_REPORT_TEMPLATE_REQUEST:
      return {
        ...state,
        isLoadingTemplates: true,
        templatesError: null,
      };

    case REPORTS_ACTION_TYPES.CREATE_REPORT_TEMPLATE_SUCCESS:
      return {
        ...state,
        isLoadingTemplates: false,
        reportTemplates: [action.payload, ...state.reportTemplates],
        templatesError: null,
      };

    case REPORTS_ACTION_TYPES.CREATE_REPORT_TEMPLATE_FAILURE:
      return {
        ...state,
        isLoadingTemplates: false,
        templatesError: action.payload,
      };

    // Download report cases
    case REPORTS_ACTION_TYPES.DOWNLOAD_REPORT_REQUEST:
      return {
        ...state,
        isDownloading: true,
        downloadQueue: [...state.downloadQueue, action.payload],
      };

    case REPORTS_ACTION_TYPES.DOWNLOAD_REPORT_SUCCESS:
      return {
        ...state,
        isDownloading: state.downloadQueue.length > 1,
        downloadQueue: state.downloadQueue.filter(id => id !== action.payload),
      };

    case REPORTS_ACTION_TYPES.DOWNLOAD_REPORT_FAILURE:
      return {
        ...state,
        isDownloading: state.downloadQueue.length > 1,
        downloadQueue: state.downloadQueue.filter(id => id !== action.payload),
        generateError: action.payload,
      };

    // Preview cases
    case REPORTS_ACTION_TYPES.SHOW_REPORT_PREVIEW:
      return {
        ...state,
        reportPreview: {
          isVisible: true,
          data: action.payload,
        },
      };

    case REPORTS_ACTION_TYPES.HIDE_REPORT_PREVIEW:
      return {
        ...state,
        reportPreview: {
          isVisible: false,
          data: null,
        },
      };

    // UI cases
    case REPORTS_ACTION_TYPES.SET_CURRENT_REPORT:
      return {
        ...state,
        currentReport: action.payload,
      };

    case REPORTS_ACTION_TYPES.CLEAR_REPORT_ERRORS:
      return {
        ...state,
        generateError: null,
        scheduleError: null,
        historyError: null,
        templatesError: null,
      };

    case REPORTS_ACTION_TYPES.SET_HISTORY_FILTERS:
      return {
        ...state,
        historyFilters: action.payload,
      };

    case REPORTS_ACTION_TYPES.CLEAR_HISTORY_FILTERS:
      return {
        ...state,
        historyFilters: {},
      };

    default:
      return state;
  }
};