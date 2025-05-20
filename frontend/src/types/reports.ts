import { BaseResponse, DateRange } from './common';

/**
 * Report type
 */
export type ReportType = 'performance' | 'risk' | 'allocation' | 'optimization' | 'comparison' | 'full';

/**
 * Report format
 */
export type ReportFormat = 'pdf' | 'html' | 'excel';

/**
 * Report section
 */
export interface ReportSection {
  id: string;
  name: string;
  description: string;
  included: boolean;
}

/**
 * Report request
 */
export interface ReportRequest {
  portfolioId: string;
  reportType: ReportType;
  dateRange: DateRange;
  benchmark?: string;
  sections?: string[];
  format?: ReportFormat;
  title?: string;
  comments?: string;
}

/**
 * Comparison report request
 */
export interface ComparisonReportRequest {
  portfolioIds: string[];
  reportType: ReportType;
  dateRange: DateRange;
  benchmark?: string;
  sections?: string[];
  format?: ReportFormat;
  title?: string;
  comments?: string;
}

/**
 * Schedule frequency
 */
export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly';

/**
 * Schedule report request
 */
export interface ScheduleReportRequest {
  portfolioId: string;
  reportType: ReportType;
  frequency: ScheduleFrequency;
  dayOfWeek?: number;
  dayOfMonth?: number;
  benchmark?: string;
  sections?: string[];
  format?: ReportFormat;
  email?: string;
  title?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Report response
 */
export interface ReportResponse extends BaseResponse {
  reportId: string;
  title: string;
  generatedAt: string;
  format: ReportFormat;
  url: string;
  previewUrl?: string;
  size: number;
}

/**
 * Schedule report response
 */
export interface ScheduleReportResponse extends BaseResponse {
  id: string;
  portfolioId: string;
  portfolioName: string;
  reportType: ReportType;
  frequency: ScheduleFrequency;
  nextGeneration: string;
  format: ReportFormat;
  email?: string;
  title: string;
  createdAt: string;
  lastGenerated?: string;
}

/**
 * Report history item
 */
export interface ReportHistoryItem {
  id: string;
  portfolioId: string;
  portfolioName: string;
  reportType: ReportType;
  title: string;
  generatedAt: string;
  format: ReportFormat;
  url: string;
  size: number;
  scheduled: boolean;
}

/**
 * Report history response
 */
export type ReportHistoryResponse = ReportHistoryItem[];

/**
 * Style setting for report template
 */
export interface StyleSetting {
  fontFamily?: string;
  fontSize?: number;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  headerColor?: string;
  logoUrl?: string;
}

/**
 * Report template request
 */
export interface ReportTemplateRequest {
  name: string;
  description: string;
  sections: string[];
  format: ReportFormat;
  styleSettings?: StyleSetting;
}

/**
 * Report template response
 */
export interface ReportTemplateResponse extends BaseResponse {
  id: string;
  name: string;
  description: string;
  sections: ReportSection[];
  format: ReportFormat;
  styleSettings: StyleSetting;
  createdAt: string;
  updatedAt: string;
}