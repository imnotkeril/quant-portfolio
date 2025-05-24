/**
 * Reports sagas
 */
import { call, put, takeEvery, takeLatest, all } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { reportService } from '../../services/reports/reportService';
import {
  REPORTS_ACTION_TYPES,
  generateReportSuccess,
  generateReportFailure,
  generateComparisonReportSuccess,
  generateComparisonReportFailure,
  scheduleReportSuccess,
  scheduleReportFailure,
  loadScheduledReportsSuccess,
  loadScheduledReportsFailure,
  cancelScheduledReportSuccess,
  cancelScheduledReportFailure,
  loadReportHistorySuccess,
  loadReportHistoryFailure,
  loadReportTemplatesSuccess,
  loadReportTemplatesFailure,
  createReportTemplateSuccess,
  createReportTemplateFailure,
  downloadReportSuccess,
  downloadReportFailure,
} from './actions';
import {
  ReportRequest,
  ComparisonReportRequest,
  ScheduleReportRequest,
  ReportTemplateRequest,
} from '../../types/reports';

// Generate report saga
function* generateReportSaga(action: PayloadAction<ReportRequest>) {
  try {
    const response = yield call(reportService.generateReport, action.payload);
    yield put(generateReportSuccess(response));
  } catch (error: any) {
    yield put(generateReportFailure(error.message || 'Failed to generate report'));
  }
}

// Generate comparison report saga
function* generateComparisonReportSaga(action: PayloadAction<ComparisonReportRequest>) {
  try {
    const response = yield call(reportService.generateComparisonReport, action.payload);
    yield put(generateComparisonReportSuccess(response));
  } catch (error: any) {
    yield put(generateComparisonReportFailure(error.message || 'Failed to generate comparison report'));
  }
}

// Schedule report saga
function* scheduleReportSaga(action: PayloadAction<ScheduleReportRequest>) {
  try {
    const response = yield call(reportService.scheduleReport, action.payload);
    yield put(scheduleReportSuccess(response));
  } catch (error: any) {
    yield put(scheduleReportFailure(error.message || 'Failed to schedule report'));
  }
}

// Load scheduled reports saga
function* loadScheduledReportsSaga() {
  try {
    const response = yield call(reportService.getScheduledReports);
    yield put(loadScheduledReportsSuccess(response));
  } catch (error: any) {
    yield put(loadScheduledReportsFailure(error.message || 'Failed to load scheduled reports'));
  }
}

// Cancel scheduled report saga
function* cancelScheduledReportSaga(action: PayloadAction<string>) {
  try {
    yield call(reportService.cancelScheduledReport, action.payload);
    yield put(cancelScheduledReportSuccess(action.payload));
  } catch (error: any) {
    yield put(cancelScheduledReportFailure(error.message || 'Failed to cancel scheduled report'));
  }
}

// Load report history saga
function* loadReportHistorySaga(action: PayloadAction<{
  portfolioId?: string;
  reportType?: string;
  startDate?: string;
  endDate?: string;
} | undefined>) {
  try {
    const filters = action.payload;
    const response = yield call(
      reportService.getReportHistory,
      filters?.portfolioId,
      filters?.reportType,
      filters?.startDate,
      filters?.endDate
    );
    yield put(loadReportHistorySuccess(response));
  } catch (error: any) {
    yield put(loadReportHistoryFailure(error.message || 'Failed to load report history'));
  }
}

// Load report templates saga
function* loadReportTemplatesSaga() {
  try {
    const response = yield call(reportService.getReportTemplates);
    yield put(loadReportTemplatesSuccess(response));
  } catch (error: any) {
    yield put(loadReportTemplatesFailure(error.message || 'Failed to load report templates'));
  }
}

// Create report template saga
function* createReportTemplateSaga(action: PayloadAction<ReportTemplateRequest>) {
  try {
    const response = yield call(reportService.createReportTemplate, action.payload);
    yield put(createReportTemplateSuccess(response));
  } catch (error: any) {
    yield put(createReportTemplateFailure(error.message || 'Failed to create report template'));
  }
}

// Download report saga
function* downloadReportSaga(action: PayloadAction<string>) {
  try {
    yield call(reportService.downloadReport, action.payload);
    yield put(downloadReportSuccess(action.payload));
  } catch (error: any) {
    yield put(downloadReportFailure(error.message || 'Failed to download report'));
  }
}

// Root saga
export function* reportsSaga() {
  yield all([
    takeEvery(REPORTS_ACTION_TYPES.GENERATE_REPORT_REQUEST, generateReportSaga),
    takeEvery(REPORTS_ACTION_TYPES.GENERATE_COMPARISON_REPORT_REQUEST, generateComparisonReportSaga),
    takeEvery(REPORTS_ACTION_TYPES.SCHEDULE_REPORT_REQUEST, scheduleReportSaga),
    takeLatest(REPORTS_ACTION_TYPES.LOAD_SCHEDULED_REPORTS_REQUEST, loadScheduledReportsSaga),
    takeEvery(REPORTS_ACTION_TYPES.CANCEL_SCHEDULED_REPORT_REQUEST, cancelScheduledReportSaga),
    takeLatest(REPORTS_ACTION_TYPES.LOAD_REPORT_HISTORY_REQUEST, loadReportHistorySaga),
    takeLatest(REPORTS_ACTION_TYPES.LOAD_REPORT_TEMPLATES_REQUEST, loadReportTemplatesSaga),
    takeEvery(REPORTS_ACTION_TYPES.CREATE_REPORT_TEMPLATE_REQUEST, createReportTemplateSaga),
    takeEvery(REPORTS_ACTION_TYPES.DOWNLOAD_REPORT_REQUEST, downloadReportSaga),
  ]);
}