/**
 * Optimization Components Index
 * Export all optimization-related components
 */

// Main optimization components
export { OptimizationForm } from './OptimizationForm/OptimizationForm';
export { EfficientFrontier } from './EfficientFrontier/EfficientFrontier';
export { WeightsTable } from './WeightsTable/WeightsTable';
export { OptimizationResults } from './OptimizationResults/OptimizationResults';
export { OptimizationComparison } from './OptimizationComparison/OptimizationComparison';
export { ConstraintsEditor } from './ConstraintsEditor/ConstraintsEditor';

// Type exports
export type { WeightItem } from './WeightsTable/WeightsTable';
export type { Constraint, ConstraintGroup } from './ConstraintsEditor/ConstraintsEditor';

// Re-export optimization types for convenience
export type {
  OptimizationRequest,
  OptimizationResponse,
  OptimizationMethod,
  EfficientFrontierRequest,
  EfficientFrontierResponse,
  EfficientFrontierPoint,
  MarkowitzRequest,
  RiskParityRequest,
} from '../../types/optimization';