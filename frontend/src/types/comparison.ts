/**
 * Portfolio comparison types
 */
import { ApiResponse } from './common';

/**
 * Portfolio Comparison Request
 */
export interface PortfolioComparisonRequest {
  portfolio1: Record<string, any>;
  portfolio2: Record<string, any>;
  startDate?: string;
  endDate?: string;
  benchmark?: string;
}

/**
 * Composition Comparison Request
 */
export interface CompositionComparisonRequest {
  portfolio1: Record<string, any>;
  portfolio2: Record<string, any>;
}

/**
 * Performance Comparison Request
 */
export interface PerformanceComparisonRequest {
  returns1: Record<string, number[]> | any;
  returns2: Record<string, number[]> | any;
  benchmarkReturns?: Record<string, number[]> | any;
  portfolio1Id: string;
  portfolio2Id: string;
  benchmarkId?: string;
}

/**
 * Risk Comparison Request
 */
export interface RiskComparisonRequest {
  returns1: Record<string, number[]> | any;
  returns2: Record<string, number[]> | any;
  benchmarkReturns?: Record<string, number[]> | any;
  portfolio1Id: string;
  portfolio2Id: string;
  benchmarkId?: string;
}

/**
 * Sector Comparison Request
 */
export interface SectorComparisonRequest {
  portfolio1: Record<string, any>;
  portfolio2: Record<string, any>;
}

/**
 * Scenario Comparison Request
 */
export interface ScenarioComparisonRequest {
  portfolio1: Record<string, any>;
  portfolio2: Record<string, any>;
  scenarios: string[];
}

/**
 * Differential Returns Request
 */
export interface DifferentialReturnsRequest {
  returns1: Record<string, number[]> | any;
  returns2: Record<string, number[]> | any;
  portfolio1Id: string;
  portfolio2Id: string;
}

/**
 * Composition Difference
 */
export interface CompositionDifference {
  commonAssets: string[];
  onlyInFirst: string[];
  onlyInSecond: string[];
  weightDifferences: Record<string, number>;
  sectorDifferences: Record<string, number>;
  assetClassDifferences: Record<string, number>;
  concentrationDifference: number;
}

/**
 * Composition Comparison Response
 */
export interface CompositionComparisonResponse {
  compositionComparison: CompositionDifference;
  portfolio1Id: string;
  portfolio2Id: string;
}

/**
 * Performance Comparison
 */
export interface PerformanceComparison {
  returnMetrics: Record<string, Record<string, number>>;
  periodReturns: Record<string, Record<string, number>>;
  cumulativeReturns?: Record<string, number[]>;
  rollingReturns?: Record<string, Record<string, number[]>>;
  outperformanceFrequency?: number;
  trackingError?: number;
  informationRatio?: number;
}

/**
 * Performance Comparison Response
 */
export interface PerformanceComparisonResponse {
  performanceComparison: PerformanceComparison;
  portfolio1Id: string;
  portfolio2Id: string;
  benchmarkId?: string;
}

/**
 * Risk Comparison
 */
export interface RiskComparison {
  volatility: Record<string, number>;
  drawdownMetrics: Record<string, Record<string, number>>;
  varMetrics: Record<string, Record<string, number>>;
  ratioMetrics: Record<string, Record<string, number>>;
  tailRisk?: Record<string, Record<string, number>>;
  distributionMetrics?: Record<string, Record<string, number>>;
}

/**
 * Risk Comparison Response
 */
export interface RiskComparisonResponse {
  riskComparison: RiskComparison;
  portfolio1Id: string;
  portfolio2Id: string;
  benchmarkId?: string;
}

/**
 * Sector Comparison Response
 */
export interface SectorComparisonResponse {
  sectorComparison: Record<string, Record<string, number>>;
  portfolio1Id: string;
  portfolio2Id: string;
}

/**
 * Scenario Test Result
 */
export interface ScenarioTestResult {
  impactPercentage: number;
  absoluteLoss: number;
  recoveryTime?: number;
  mostAffectedAssets: Record<string, number>;
  mostResilientAssets: Record<string, number>;
}

/**
 * Scenario Comparison
 */
export interface ScenarioComparison {
  scenarioName: string;
  portfolio1Result: ScenarioTestResult;
  portfolio2Result: ScenarioTestResult;
  relativeResilience: number;
  keyDifferences: string[];
}

/**
 * Scenario Comparison Response
 */
export interface ScenarioComparisonResponse {
  scenarioComparison: Record<string, ScenarioComparison>;
  portfolio1Id: string;
  portfolio2Id: string;
  scenarios: string[];
  overallResilienceComparison: Record<string, number>;
}

/**
 * Differential Returns Response
 */
export interface DifferentialReturnsResponse {
  differentialReturns: Record<string, number>;
  portfolio1Id: string;
  portfolio2Id: string;
  statistics: Record<string, number>;
  outperformancePeriods: Record<string, number>;
}

/**
 * Portfolio Comparison Response
 */
export interface PortfolioComparisonResponse {
  compositionComparison: CompositionDifference;
  performanceComparison: PerformanceComparison;
  riskComparison: RiskComparison;
  sectorComparison?: Record<string, Record<string, number>>;
  scenarioComparison?: Record<string, ScenarioComparison>;
  differentialReturnsStatistics?: Record<string, number>;
  portfolio1Id: string;
  portfolio2Id: string;
  benchmarkId?: string;
  startDate?: string;
  endDate?: string;
  summary: string[];
  recommendations?: string[];
}

/**
 * API Portfolio Comparison Response
 */
export type ApiPortfolioComparisonResponse = ApiResponse<PortfolioComparisonResponse>;

/**
 * API Composition Comparison Response
 */
export type ApiCompositionComparisonResponse = ApiResponse<CompositionComparisonResponse>;

/**
 * API Performance Comparison Response
 */
export type ApiPerformanceComparisonResponse = ApiResponse<PerformanceComparisonResponse>;

/**
 * API Risk Comparison Response
 */
export type ApiRiskComparisonResponse = ApiResponse<RiskComparisonResponse>;

/**
 * API Sector Comparison Response
 */
export type ApiSectorComparisonResponse = ApiResponse<SectorComparisonResponse>;

/**
 * API Scenario Comparison Response
 */
export type ApiScenarioComparisonResponse = ApiResponse<ScenarioComparisonResponse>;

/**
 * API Differential Returns Response
 */
export type ApiDifferentialReturnsResponse = ApiResponse<DifferentialReturnsResponse>;