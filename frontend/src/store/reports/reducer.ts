/**
 * Reports reducer
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ReportState, initialReportState } from './types';
import {
  generateReport,
  generateComparisonReport,
  scheduleReport,
  loadScheduledReports,
  cancelScheduledReport,
  loadReportHistory,
  loadReportTemplates,
  createReportTemplate,
  downloadReport,
} from './actions';

const reportsSlice = createSlice({
  name: 'reports',
  initialState: initialReportState,
  reducers: {
    // UI actions
    setCurrentReport: (state, action: PayloadAction<any>) => {
      state.currentReport = action.payload;
    },
    clearReportErrors: (state) => {
      state.generateError = null;
      state.scheduleError = null;
      state.historyError = null;
      state.templatesError = null;
    },
    setHistoryFilters: (state, action: PayloadAction<any>) => {
      state.historyFilters = action.payload;
    },
    clearHistoryFilters: (state) => {
      state.historyFilters = {};
    },
    showReportPreview: (state, action: PayloadAction<any>) => {
      state.reportPreview = {
        isVisible: true,
        data: action.payload,
      };
    },
    hideReportPreview: (state) => {
      state.reportPreview = {
        isVisible: false,
        data: null,
      };
    },
    clearReportsData: (state) => {
      state.reports = [];
      state.currentReport = null;
      state.scheduledReports = [];
      state.reportHistory = [];
      state.reportTemplates = [];
    },
  },
  extraReducers: (builder) => {
    // Generate report
    builder
      .addCase(generateReport.pending, (state) => {
        state.isGenerating = true;
        state.generateError = null;
      })
      .addCase(generateReport.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.reports = [action.payload, ...state.reports];
        state.currentReport = action.payload;
      })
      .addCase(generateReport.rejected, (state, action) => {
        state.isGenerating = false;
        state.generateError = action.payload || 'Failed to generate report';
      });

    // Generate comparison report
    builder
      .addCase(generateComparisonReport.pending, (state) => {
        state.isGenerating = true;
        state.generateError = null;
      })
      .addCase(generateComparisonReport.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.reports = [action.payload, ...state.reports];
        state.currentReport = action.payload;
      })
      .addCase(generateComparisonReport.rejected, (state, action) => {
        state.isGenerating = false;
        state.generateError = action.payload || 'Failed to generate comparison report';
      });

    // Schedule report
    builder
      .addCase(scheduleReport.pending, (state) => {
        state.isScheduling = true;
        state.scheduleError = null;
      })
      .addCase(scheduleReport.fulfilled, (state, action) => {
        state.isScheduling = false;
        state.scheduledReports = [action.payload, ...state.scheduledReports];
      })
      .addCase(scheduleReport.rejected, (state, action) => {
        state.isScheduling = false;
        state.scheduleError = action.payload || 'Failed to schedule report';
      });

    // Load scheduled reports
    builder
      .addCase(loadScheduledReports.pending, (state) => {
        state.isLoadingHistory = true;
        state.scheduleError = null;
      })
      .addCase(loadScheduledReports.fulfilled, (state, action) => {
        state.isLoadingHistory = false;
        state.scheduledReports = action.payload;
      })
      .addCase(loadScheduledReports.rejected, (state, action) => {
        state.isLoadingHistory = false;
        state.scheduleError = action.payload || 'Failed to load scheduled reports';
      });

    // Cancel scheduled report
    builder
      .addCase(cancelScheduledReport.pending, (state) => {
        state.scheduleError = null;
      })
      .addCase(cancelScheduledReport.fulfilled, (state, action) => {
        state.scheduledReports = state.scheduledReports.filter(
          report => report.reportId !== action.payload
        );
      })
      .addCase(cancelScheduledReport.rejected, (state, action) => {
        state.scheduleError = action.payload || 'Failed to cancel scheduled report';
      });

    // Load report history
    builder
      .addCase(loadReportHistory.pending, (state) => {
        state.isLoadingHistory = true;
        state.historyError = null;
      })
      .addCase(loadReportHistory.fulfilled, (state, action) => {
        state.isLoadingHistory = false;
        state.reportHistory = action.payload;
      })
      .addCase(loadReportHistory.rejected, (state, action) => {
        state.isLoadingHistory = false;
        state.historyError = action.payload || 'Failed to load report history';
      });

    // Load report templates
    builder
      .addCase(loadReportTemplates.pending, (state) => {
        state.isLoadingTemplates = true;
        state.templatesError = null;
      })
      .addCase(loadReportTemplates.fulfilled, (state, action) => {
        state.isLoadingTemplates = false;
        state.reportTemplates = action.payload;
      })
      .addCase(loadReportTemplates.rejected, (state, action) => {
        state.isLoadingTemplates = false;
        state.templatesError = action.payload || 'Failed to load report templates';
      });

    // Create report template
    builder
      .addCase(createReportTemplate.pending, (state) => {
        state.isLoadingTemplates = true;
        state.templatesError = null;
      })
      .addCase(createReportTemplate.fulfilled, (state, action) => {
        state.isLoadingTemplates = false;
        state.reportTemplates = [action.payload, ...state.reportTemplates];
      })
      .addCase(createReportTemplate.rejected, (state, action) => {
        state.isLoadingTemplates = false;
        state.templatesError = action.payload || 'Failed to create report template';
      });

    // Download report
    builder
      .addCase(downloadReport.pending, (state, action) => {
        state.isDownloading = true;
        state.downloadQueue = [...state.downloadQueue, action.meta.arg];
      })
      .addCase(downloadReport.fulfilled, (state, action) => {
        state.isDownloading = state.downloadQueue.length > 1;
        state.downloadQueue = state.downloadQueue.filter(id => id !== action.meta.arg);
      })
      .addCase(downloadReport.rejected, (state, action) => {
        state.isDownloading = state.downloadQueue.length > 1;
        state.downloadQueue = state.downloadQueue.filter(id => id !== action.meta.arg);
        state.generateError = action.payload || 'Failed to download report';
      });
  },
});

export const {
  setCurrentReport,
  clearReportErrors,
  setHistoryFilters,
  clearHistoryFilters,
  showReportPreview,
  hideReportPreview,
  clearReportsData,
} = reportsSlice.actions;

export default reportsSlice.reducer;