/**
 * Report types
 */
import { ApiResponse } from './common';

/**
 * Report Type
 */
export type ReportType =
  | 'performance'
  | 'risk'
  | 'optimization'
  | 'scenario'
  | 'historical'
  | 'comparison'
  | 'comprehensive'
  | 'custom';

/**
 * Report Format
 */
export type ReportFormat =
  | 'pdf'
  | 'html'
  | 'excel'
  | 'json'
  | 'csv';

/**
 * Report Frequency
 */
export type ReportFrequency =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'annual'
  | 'once';

/**
 * Report Request
 */
export interface ReportRequest {
  portfolioId: string;
  reportType: ReportType;
  startDate?: string;
  endDate?: string;
  benchmark?: string;
  sections?: string[];
  format: ReportFormat;
  runInBackground?: boolean;
}

/**
 * Report Response
 */
export interface ReportResponse {
  status: 'completed' | 'processing' | 'failed';
  reportPath?: string;
  message?: string;
  portfolioId: string;
  reportType: ReportType;
  format: ReportFormat;
  generatedAt?: string;
  reportId?: string;
}

/**
 * Comparison Report Request
 */
export interface ComparisonReportRequest {
  portfolioIds: string[];
  reportType: ReportType;
  startDate?: string;
  endDate?: string;
  benchmark?: string;
  sections?: string[];
  format: ReportFormat;
  runInBackground?: boolean;
}

/**
 * Schedule Report Request
 */
export interface ScheduleReportRequest {
  portfolioId: string;
  reportType: ReportType;
  frequency: ReportFrequency;
  email?: string;
  reportParams: Record<string, any>;
}

/**
 * Schedule Report Response
 */
export interface ScheduleReportResponse {
  reportId: string;
  portfolioId: string;
  reportType: ReportType;
  frequency: ReportFrequency;
  status: 'active' | 'paused';
  nextRun?: string;
  email?: string;
}

/**
 * Report History Response
 */
export interface ReportHistoryResponse {
  reportId: string;
  portfolioId: string;
  reportType: ReportType;
  format: ReportFormat;
  generatedAt: string;
  status: 'completed' | 'failed';
  filePath?: string;
  fileSize?: number;
  durationMs?: number;
  parameters: Record<string, any>;
}

/**
 * Report Section
 */
export interface ReportSection {
  id: string;
  name: string;
  description?: string;
  required: boolean;
  default: boolean;
  order: number;
  dependencies?: string[];
}

/**
 * Report Template Request
 */
export interface ReportTemplateRequest {
  name: string;
  description?: string;
  sections: string[];
  format: ReportFormat;
  styleSettings?: Record<string, any>;
}

/**
 * Report Template Response
 */
export interface ReportTemplateResponse {
  templateId: string;
  name: string;
  description?: string;
  format: ReportFormat;
  sections?: ReportSection[];
  createdAt?: string;
  updatedAt?: string;
  isSystem: boolean;
}

/**
 * Report File Info Response
 */
export interface ReportFileInfoResponse {
  reportId: string;
  filePath: string;
  fileName: string;
  format: ReportFormat;
  mimeType: string;
  fileSize: number;
  createdAt: string;
  downloadUrl: string;
}

/**
 * Report Template
 */
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  reportType: ReportType;
  sections: string[];
  format: ReportFormat;
  styleSettings: Record<string, any>;
  createdAt: string;
}

/**
 * Generated Report
 */
export interface Report {
  id: string;
  name: string;
  description: string;
  templateId?: string;
  portfolioId?: string;
  comparisonPortfolioIds?: string[];
  reportType: ReportType;
  format: ReportFormat;
  filePath?: string;
  startDate?: string;
  endDate?: string;
  benchmark?: string;
  sections?: string[];
  generationStatus: 'pending' | 'in_progress' | 'completed' | 'failed';
  metadata?: Record<string, any>;
  createdAt: string;
}

/**
 * Scheduled Report
 */
export interface ScheduledReport {
  id: string;
  name: string;
  description: string;
  templateId?: string;
  portfolioId?: string;
  comparisonPortfolioIds?: string[];
  reportType: ReportType;
  format: ReportFormat;
  frequency: ReportFrequency;
  nextGeneration?: string;
  lastGenerated?: string;
  emailRecipients?: string[];
  isActive: boolean;
  parameters?: Record<string, any>;
  createdAt: string;
}

export interface PortfolioCreateRequest {
  name: string;
  description?: string;
  type: string;
  benchmarkSymbol?: string;
  assets: Asset[];
  tags?: string[];
}

export enum PortfolioType {
  CONSERVATIVE = 'conservative',
  MODERATE = 'moderate',
  AGGRESSIVE = 'aggressive',
  CUSTOM = 'custom'
}

/**
 * API Report Response
 */
export type ApiReportResponse = ApiResponse<ReportResponse>;

/**
 * API Schedule Report Response
 */
export type ApiScheduleReportResponse = ApiResponse<ScheduleReportResponse>;

/**
 * API Report History Response
 */
export type ApiReportHistoryResponse = ApiResponse<ReportHistoryResponse[]>;

/**
 * API Report Templates Response
 */
export type ApiReportTemplatesResponse = ApiResponse<ReportTemplateResponse[]>;

/**
 * API Report Template Response
 */
export type ApiReportTemplateResponse = ApiResponse<ReportTemplateResponse>;