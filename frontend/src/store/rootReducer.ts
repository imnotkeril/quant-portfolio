/**
 * Root Reducer
 * Combines all feature reducers into a single root reducer
 */
import { combineReducers } from '@reduxjs/toolkit';
import portfolioReducer from './portfolio/reducer';
import analyticsReducer from './analytics/reducer';
import optimizationReducer from './optimization/reducer';
import riskReducer from './risk/reducer';
import scenariosReducer from './scenarios/reducer';
import historicalReducer from './historical/reducer';
import comparisonReducer from './comparison/reducer';
import reportsReducer from './reports/reducer';

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