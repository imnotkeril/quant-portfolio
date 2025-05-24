/**
 * Reports selectors
 */
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../rootReducer';
import { ReportType } from '../../types/reports';

// Basic selectors
export const selectReportsState = (state: RootState) => state.reports;

export const selectReports = (state: RootState) => state.reports.reports;
export const selectCurrentReport = (state: RootState) => state.reports.currentReport;

export const selectScheduledReports = (state: RootState) => state.reports.scheduledReports;
export const selectReportHistory = (state: RootState) => state.reports.reportHistory;
export const selectReportTemplates = (state: RootState) => state.reports.reportTemplates;

// Loading states
export const selectIsGeneratingReport = (state: RootState) => state.reports.isGenerating;
export const selectIsSchedulingReport = (state: RootState) => state.reports.isScheduling;
export const selectIsLoadingHistory = (state: RootState) => state.reports.isLoadingHistory;
export const selectIsLoadingTemplates = (state: RootState) => state.reports.isLoadingTemplates;
export const selectIsDownloading = (state: RootState) => state.reports.isDownloading;

// Error states
export const selectGenerateError = (state: RootState) => state.reports.generateError;
export const selectScheduleError = (state: RootState) => state.reports.scheduleError;
export const selectHistoryError = (state: RootState) => state.reports.historyError;
export const selectTemplatesError = (state: RootState) => state.reports.templatesError;

// Filters
export const selectHistoryFilters = (state: RootState) => state.reports.historyFilters;

// Preview
export const selectReportPreview = (state: RootState) => state.reports.reportPreview;
export const selectIsPreviewVisible = (state: RootState) => state.reports.reportPreview.isVisible;

// Download
export const selectDownloadQueue = (state: RootState) => state.reports.downloadQueue;

// Complex selectors
export const selectReportsByType = createSelector(
  [selectReports],
  (reports) => {
    return reports.reduce((acc, report) => {
      const type = report.reportType;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(report);
      return acc;
    }, {} as Record<ReportType, any[]>);
  }
);

export const selectReportsByPortfolio = createSelector(
  [selectReports],
  (reports) => {
    return reports.reduce((acc, report) => {
      const portfolioId = report.portfolioId;
      if (!acc[portfolioId]) {
        acc[portfolioId] = [];
      }
      acc[portfolioId].push(report);
      return acc;
    }, {} as Record<string, any[]>);
  }
);

export const selectScheduledReportsByPortfolio = createSelector(
  [selectScheduledReports],
  (scheduledReports) => {
    return scheduledReports.reduce((acc, report) => {
      const portfolioId = report.portfolioId;
      if (!acc[portfolioId]) {
        acc[portfolioId] = [];
      }
      acc[portfolioId].push(report);
      return acc;
    }, {} as Record<string, any[]>);
  }
);

export const selectActiveScheduledReports = createSelector(
  [selectScheduledReports],
  (scheduledReports) => {
    return scheduledReports.filter(report => report.status === 'active');
  }
);

export const selectFilteredReportHistory = createSelector(
  [selectReportHistory, selectHistoryFilters],
  (history, filters) => {
    return history.filter(report => {
      if (filters.portfolioId && report.portfolioId !== filters.portfolioId) {
        return false;
      }
      if (filters.reportType && report.reportType !== filters.reportType) {
        return false;
      }
      if (filters.startDate && new Date(report.generatedAt) < new Date(filters.startDate)) {
        return false;
      }
      if (filters.endDate && new Date(report.generatedAt) > new Date(filters.endDate)) {
        return false;
      }
      return true;
    });
  }
);

export const selectCompletedReports = createSelector(
  [selectReportHistory],
  (history) => {
    return history.filter(report => report.status === 'completed');
  }
);

export const selectFailedReports = createSelector(
  [selectReportHistory],
  (history) => {
    return history.filter(report => report.status === 'failed');
  }
);

export const selectReportTemplatesByType = createSelector(
  [selectReportTemplates],
  (templates) => {
    return templates.reduce((acc, template) => {
      // Note: template type is not in the current interface,
      // but we'll group by name for now
      const category = template.name.includes('Performance') ? 'performance' :
                      template.name.includes('Risk') ? 'risk' :
                      template.name.includes('Optimization') ? 'optimization' :
                      'custom';

      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(template);
      return acc;
    }, {} as Record<string, any[]>);
  }
);

export const selectSystemTemplates = createSelector(
  [selectReportTemplates],
  (templates) => {
    return templates.filter(template => template.isSystem);
  }
);

export const selectCustomTemplates = createSelector(
  [selectReportTemplates],
  (templates) => {
    return templates.filter(template => !template.isSystem);
  }
);

export const selectRecentReports = createSelector(
  [selectReports],
  (reports) => {
    return reports
      .slice()
      .sort((a, b) => new Date(b.generatedAt || 0).getTime() - new Date(a.generatedAt || 0).getTime())
      .slice(0, 10);
  }
);

export const selectReportStatistics = createSelector(
  [selectReportHistory],
  (history) => {
    const total = history.length;
    const completed = history.filter(r => r.status === 'completed').length;
    const failed = history.filter(r => r.status === 'failed').length;

    const byType = history.reduce((acc, report) => {
      acc[report.reportType] = (acc[report.reportType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byFormat = history.reduce((acc, report) => {
      acc[report.format] = (acc[report.format] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      completed,
      failed,
      successRate: total > 0 ? (completed / total) * 100 : 0,
      byType,
      byFormat,
    };
  }
);

export const selectHasAnyError = createSelector(
  [selectGenerateError, selectScheduleError, selectHistoryError, selectTemplatesError],
  (generateError, scheduleError, historyError, templatesError) => {
    return !!(generateError || scheduleError || historyError || templatesError);
  }
);

export const selectIsAnyLoading = createSelector(
  [selectIsGeneratingReport, selectIsSchedulingReport, selectIsLoadingHistory, selectIsLoadingTemplates, selectIsDownloading],
  (isGenerating, isScheduling, isLoadingHistory, isLoadingTemplates, isDownloading) => {
    return isGenerating || isScheduling || isLoadingHistory || isLoadingTemplates || isDownloading;
  }
);