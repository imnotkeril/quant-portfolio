/**
 * Reports sagas
 * Side effects and complex async logic for reports operations
 */
import { SagaIterator } from 'redux-saga';
import { call, put, takeEvery, takeLatest, select, delay, all } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
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
import {
  selectCurrentReport,
  selectHistoryFilters,
  selectScheduledReports
} from './selectors';
import { RootState } from '../rootReducer';
import { reportService } from '../../services/reports/reportService';

/**
 * Auto-refresh scheduled reports
 */
function* autoRefreshScheduledReportsSaga(): SagaIterator {
  while (true) {
    try {
      // Wait 5 minutes
      yield delay(5 * 60 * 1000);

      // Refresh scheduled reports
      yield put(loadScheduledReports());
    } catch (error) {
      console.error('Auto-refresh scheduled reports error:', error);
    }
  }
}

/**
 * Generate report with retry logic
 */
function* generateReportWithRetrySaga(action: PayloadAction<any>): SagaIterator {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      yield put(generateReport(action.payload));
      break;
    } catch (error: any) {
      attempt++;
      if (attempt >= maxRetries) {
        console.error(`Failed to generate report after ${maxRetries} attempts:`, error);
        break;
      }

      // Wait before retry (exponential backoff)
      yield delay(Math.pow(2, attempt) * 1000);
    }
  }
}

/**
 * Batch download reports
 */
function* batchDownloadReportsSaga(action: PayloadAction<{ reportIds: string[] }>): SagaIterator {
  const { reportIds } = action.payload;

  try {
    // Download reports one by one with small delay
    for (const reportId of reportIds) {
      yield put(downloadReport(reportId));
      // Small delay to prevent overwhelming the server
      yield delay(1000);
    }
  } catch (error) {
    console.error('Error in batch download:', error);
  }
}

/**
 * Cleanup old reports
 */
function* cleanupOldReportsSaga(action: PayloadAction<{ olderThanDays: number }>): SagaIterator {
  try {
    const { olderThanDays } = action.payload;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    // Load current history
    yield put(loadReportHistory({}));

    // Wait for history to load
    yield delay(1000);

    const state: RootState = yield select();
    const reportHistory = state.reports.reportHistory;

    // Find old reports
    const oldReports = reportHistory.filter(report =>
      new Date(report.generatedAt) < cutoffDate
    );

    // Here you would typically call an API to delete old reports
    // For now, just log what would be deleted
    console.log(`Would delete ${oldReports.length} old reports`);

    // Refresh history after cleanup
    yield put(loadReportHistory({}));
  } catch (error) {
    console.error('Error cleaning up old reports:', error);
  }
}

/**
 * Schedule periodic report generation
 */
function* schedulePeriodicReportsSaga(): SagaIterator {
  while (true) {
    try {
      // Check every hour for scheduled reports that need to run
      yield delay(60 * 60 * 1000);

      const scheduledReports = yield select(selectScheduledReports);
      const now = new Date();

      for (const scheduledReport of scheduledReports) {
        if (scheduledReport.status === 'active' && scheduledReport.nextRun) {
          const nextRun = new Date(scheduledReport.nextRun);

          if (now >= nextRun) {
            // Generate the scheduled report
            const reportRequest = {
              portfolioId: scheduledReport.portfolioId,
              reportType: scheduledReport.reportType,
              format: scheduledReport.format || 'pdf',
              sections: scheduledReport.sections,
              runInBackground: true,
            };

            yield put(generateReport(reportRequest));
          }
        }
      }
    } catch (error) {
      console.error('Error in periodic report scheduling:', error);
    }
  }
}

/**
 * Export report data saga
 */
function* exportReportDataSaga(action: PayloadAction<{
  reportId: string;
  format: 'json' | 'csv' | 'excel'
}>): SagaIterator {
  try {
    const { reportId, format } = action.payload;
    const currentReport = yield select(selectCurrentReport);

    if (!currentReport || currentReport.reportId !== reportId) {
      console.error('Report not found for export');
      return;
    }

    // Prepare export data
    const exportData = {
      reportId: currentReport.reportId,
      portfolioId: currentReport.portfolioId,
      reportType: currentReport.reportType,
      generatedAt: currentReport.generatedAt,
      format: currentReport.format,
      status: currentReport.status,
      exportedAt: new Date().toISOString(),
    };

    // Export based on format
    switch (format) {
      case 'json':
        const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json',
        });
        const jsonUrl = URL.createObjectURL(jsonBlob);
        const jsonLink = document.createElement('a');
        jsonLink.href = jsonUrl;
        jsonLink.download = `report_${reportId}.json`;
        jsonLink.click();
        URL.revokeObjectURL(jsonUrl);
        break;

      case 'csv':
        let csvContent = 'Field,Value\n';
        Object.entries(exportData).forEach(([key, value]) => {
          csvContent += `${key},${value}\n`;
        });

        const csvBlob = new Blob([csvContent], { type: 'text/csv' });
        const csvUrl = URL.createObjectURL(csvBlob);
        const csvLink = document.createElement('a');
        csvLink.href = csvUrl;
        csvLink.download = `report_${reportId}.csv`;
        csvLink.click();
        URL.revokeObjectURL(csvUrl);
        break;

      case 'excel':
        // For Excel export, you might want to use a library like xlsx
        console.log('Excel export not implemented yet');
        break;

      default:
        console.warn('Unsupported export format:', format);
    }
  } catch (error) {
    console.error('Error exporting report data:', error);
  }
}

/**
 * Generate report preview
 */
function* generateReportPreviewSaga(action: PayloadAction<any>): SagaIterator {
  try {
    const request = action.payload;

    // Generate preview data (simplified version of report)
    const previewData = reportService.generateReportPreview(request);

    // Update preview state
    yield put({
      type: 'reports/showReportPreview',
      payload: previewData,
    });
  } catch (error) {
    console.error('Error generating report preview:', error);
  }
}

/**
 * Validate report request
 */
function* validateReportRequestSaga(action: PayloadAction<any>): SagaIterator {
  try {
    const request = action.payload;
    const validation = reportService.validateReportRequest(request);

    if (!validation.isValid) {
      console.error('Report request validation failed:', validation.errors);
      yield put({
        type: 'reports/setValidationErrors',
        payload: validation.errors,
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating report request:', error);
    return false;
  }
}

/**
 * Handle report generation completion
 */
function* handleReportCompletionSaga(action: PayloadAction<any>): SagaIterator {
  try {
    const report = action.payload;

    if (report.status === 'completed') {
      // Refresh report history
      const filters = yield select(selectHistoryFilters);
      yield put(loadReportHistory(filters));

      // Show success notification
      yield put({
        type: 'notifications/showSuccess',
        payload: `Report "${report.reportType}" generated successfully`,
      });
    } else if (report.status === 'failed') {
      // Show error notification
      yield put({
        type: 'notifications/showError',
        payload: `Failed to generate report "${report.reportType}"`,
      });
    }
  } catch (error) {
    console.error('Error handling report completion:', error);
  }
}

/**
 * Monitor report generation progress
 */
function* monitorReportProgressSaga(action: PayloadAction<{ reportId: string }>): SagaIterator {
  try {
    const { reportId } = action.payload;
    let isCompleted = false;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes with 5-second intervals

    while (!isCompleted && attempts < maxAttempts) {
      yield delay(5000); // Wait 5 seconds
      attempts++;

      try {
        // Check report status (this would be an API call in real implementation)
        // For now, we'll simulate the status check
        const reportStatus = { status: 'completed', progress: 100 };

        if (reportStatus.status === 'completed' || reportStatus.status === 'failed') {
          isCompleted = true;
          yield call(handleReportCompletionSaga, { payload: reportStatus, type: '' });
        }

        // Update progress if available
        if (reportStatus.progress) {
          yield put({
            type: 'reports/updateReportProgress',
            payload: { reportId, progress: reportStatus.progress },
          });
        }
      } catch (error) {
        console.error('Error checking report status:', error);
      }
    }

    if (!isCompleted) {
      console.warn(`Report ${reportId} monitoring timed out`);
    }
  } catch (error) {
    console.error('Error monitoring report progress:', error);
  }
}

/**
 * Root reports saga
 */
export function* reportsSaga(): SagaIterator {
  yield all([
    // Auto-refresh scheduled reports
    takeLatest('reports/startAutoRefresh', autoRefreshScheduledReportsSaga),

    // Report generation with retry
    takeEvery('reports/generateReportWithRetry', generateReportWithRetrySaga),

    // Batch operations
    takeEvery('reports/batchDownloadReports', batchDownloadReportsSaga),

    // Cleanup operations
    takeEvery('reports/cleanupOldReports', cleanupOldReportsSaga),

    // Periodic scheduling
    takeLatest('reports/startPeriodicScheduling', schedulePeriodicReportsSaga),

    // Export operations
    takeEvery('reports/exportReportData', exportReportDataSaga),

    // Preview operations
    takeEvery('reports/generateReportPreview', generateReportPreviewSaga),

    // Validation
    takeEvery('reports/validateReportRequest', validateReportRequestSaga),

    // Progress monitoring
    takeEvery('reports/monitorReportProgress', monitorReportProgressSaga),

    // Handle completion
    takeEvery(generateReport.fulfilled.type, handleReportCompletionSaga),
    takeEvery(generateComparisonReport.fulfilled.type, handleReportCompletionSaga),
  ]);
}

export default reportsSaga;