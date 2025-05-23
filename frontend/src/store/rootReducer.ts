/**
 * Root Reducer
 * Combines all feature reducers into a single root reducer
 */
import { combineReducers } from '@reduxjs/toolkit';

// Note: Individual reducers will be imported and added here as they are created
// This is the initial setup with placeholder structure

// Placeholder for future reducers - will be replaced when feature slices are created
const portfolioReducer = (state = {}, action: any) => state;
const analyticsReducer = (state = {}, action: any) => state;
const optimizationReducer = (state = {}, action: any) => state;
const riskReducer = (state = {}, action: any) => state;
const scenariosReducer = (state = {}, action: any) => state;
const historicalReducer = (state = {}, action: any) => state;
const comparisonReducer = (state = {}, action: any) => state;
const reportsReducer = (state = {}, action: any) => state;

export const rootReducer = combineReducers({
  portfolio: portfolioReducer,
  analytics: analyticsReducer,
  optimization: optimizationReducer,
  risk: riskReducer,
  scenarios: scenariosReducer,
  historical: historicalReducer,
  comparison: comparisonReducer,
  reports: reportsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;