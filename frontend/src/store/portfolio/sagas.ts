/**
 * Portfolio sagas
 * Side effects and complex async logic for portfolio operations
 */
import { call, put, takeEvery, takeLatest, select, delay } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { portfolioService } from '../../services/portfolio/portfolioService';
import {
  loadPortfolios,
  loadPortfolio,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  updatePortfolioPrices,
} from './actions';
import { selectSelectedPortfolioId } from './selectors';
import { RootState } from '../index';

/**
 * Auto-refresh portfolios saga
 */
function* autoRefreshPortfoliosSaga() {
  while (true) {
    try {
      // Wait 5 minutes
      yield delay(5 * 60 * 1000);

      // Refresh portfolios list
      yield put(loadPortfolios());

      // Refresh current portfolio if selected
      const selectedId: string | null = yield select(selectSelectedPortfolioId);
      if (selectedId) {
        yield put(loadPortfolio({ id: selectedId }));
      }
    } catch (error) {
      console.error('Auto-refresh error:', error);
    }
  }
}

/**
 * Auto-save portfolio saga
 * Triggered when portfolio data changes
 */
function* autoSavePortfolioSaga(action: PayloadAction<any>) {
  try {
    // Wait for user to stop typing
    yield delay(2000);

    // Auto-save logic would go here
    // For now, just log that auto-save would happen
    console.log('Auto-save triggered for portfolio:', action.payload);
  } catch (error) {
    console.error('Auto-save error:', error);
  }
}

/**
 * Handle successful portfolio creation
 */
function* handlePortfolioCreatedSaga(action: PayloadAction<any>) {
  try {
    // Set the newly created portfolio as selected
    const portfolio = action.payload;
    // This would trigger through the reducer

    // Optionally show success notification
    console.log('Portfolio created successfully:', portfolio.name);

    // Refresh portfolios list to ensure consistency
    yield put(loadPortfolios());
  } catch (error) {
    console.error('Error handling portfolio creation:', error);
  }
}

/**
 * Handle successful portfolio deletion
 */
function* handlePortfolioDeletedSaga(action: PayloadAction<string>) {
  try {
    const deletedId = action.payload;

    // Optionally show success notification
    console.log('Portfolio deleted successfully:', deletedId);

    // Refresh portfolios list
    yield put(loadPortfolios());
  } catch (error) {
    console.error('Error handling portfolio deletion:', error);
  }
}

/**
 * Handle price update completion
 */
function* handlePriceUpdateCompleteSaga(action: PayloadAction<any>) {
  try {
    const updateResult = action.payload;

    // Refresh current portfolio to show updated prices
    const selectedId: string | null = yield select(selectSelectedPortfolioId);
    if (selectedId === updateResult.portfolioId) {
      yield put(loadPortfolio({ id: selectedId }));
    }

    // Show success notification
    console.log('Prices updated successfully:', updateResult);
  } catch (error) {
    console.error('Error handling price update:', error);
  }
}

/**
 * Batch operations saga
 */
function* batchOperationsSaga(action: PayloadAction<{ operations: any[] }>) {
  try {
    const { operations } = action.payload;

    // Execute operations in sequence
    for (const operation of operations) {
      switch (operation.type) {
        case 'CREATE':
          yield put(createPortfolio({ portfolio: operation.data }));
          break;
        case 'UPDATE':
          yield put(updatePortfolio({ id: operation.id, updates: operation.data }));
          break;
        case 'DELETE':
          yield put(deletePortfolio({ id: operation.id }));
          break;
        default:
          console.warn('Unknown batch operation type:', operation.type);
      }

      // Small delay between operations
      yield delay(100);
    }

    // Refresh portfolios after batch operations
    yield put(loadPortfolios());
  } catch (error) {
    console.error('Batch operations error:', error);
  }
}

/**
 * Portfolio validation saga
 */
function* validatePortfolioSaga(action: PayloadAction<any>) {
  try {
    const portfolio = action.payload;

    // Use portfolio service validation
    const validation = portfolioService.validatePortfolio(portfolio);

    if (!validation.isValid) {
      console.warn('Portfolio validation failed:', validation.errors);
      // Could dispatch validation error action here
    }

    return validation;
  } catch (error) {
    console.error('Portfolio validation error:', error);
    return { isValid: false, errors: ['Validation failed'] };
  }
}

/**
 * Root portfolio saga
 */
export function* portfolioSaga() {
  // Auto-refresh portfolios
  yield takeLatest('portfolio/startAutoRefresh', autoRefreshPortfoliosSaga);

  // Auto-save when portfolio data changes
  yield takeEvery('portfolio/portfolioDataChanged', autoSavePortfolioSaga);

  // Handle successful operations
  yield takeEvery(createPortfolio.fulfilled.type, handlePortfolioCreatedSaga);
  yield takeEvery(deletePortfolio.fulfilled.type, handlePortfolioDeletedSaga);
  yield takeEvery(updatePortfolioPrices.fulfilled.type, handlePriceUpdateCompleteSaga);

  // Batch operations
  yield takeEvery('portfolio/batchOperations', batchOperationsSaga);

  // Portfolio validation
  yield takeEvery('portfolio/validatePortfolio', validatePortfolioSaga);
}

export default portfolioSaga;