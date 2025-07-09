/**
 * Portfolio List Page Component - ИСПРАВЛЕННАЯ ВЕРСИЯ
 * Complete portfolio list with viewing, editing, and management features
 * File: frontend/src/pages/PortfolioListPage/index.tsx
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { PageContainer } from '../../components/layout/PageContainer/PageContainer';
import { Card } from '../../components/common/Card/Card';
import { Button } from '../../components/common/Button/Button';
import { Input } from '../../components/common/Input/Input';
import { Select } from '../../components/common/Select/Select';
import { Badge } from '../../components/common/Badge/Badge';
import { Modal } from '../../components/common/Modal/Modal';
import { loadPortfolios, deletePortfolio } from '../../store/portfolio/actions';
import {
  selectPortfolios,
  selectPortfoliosLoading,
  selectPortfoliosError,
  selectPortfolioFilters,
  selectPortfolioSort,
  selectPortfolioStats,
} from '../../store/portfolio/selectors';
import { setPortfolioFilters, setPortfolioSort } from '../../store/portfolio/reducer';
import { PortfolioListItem } from '../../types/portfolio';
import { PortfolioFilters, PortfolioSort } from '../../store/portfolio/types';
import { ROUTES } from '../../constants/routes';
import { formatDate } from '../../utils/formatters';
import styles from './styles.module.css';
import { PieChart } from '../../components/charts/PieChart/PieChart';
import { AssetTable } from '../../components/portfolio/AssetTable/AssetTable';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { getChartColor } from '../../utils/color';
import { useAssets } from '../../hooks/useAssets';

// Portfolio View Content Component - SAME LOGIC AS CreationStepReview
interface PortfolioViewContentProps {
  portfolio: any;
  onClose: () => void;
  onAnalyze: () => void;
}

const PortfolioViewContent: React.FC<PortfolioViewContentProps> = ({ portfolio, onClose, onAnalyze }) => {
  // SAME LOGIC AS CreationStepReview - auto-enrich assets with sectors
  const [enrichedAssets, setEnrichedAssets] = useState<any[]>([]);
  const { getAssetInfo } = useAssets();

  useEffect(() => {
    const enrichAssets = async () => {
      // Convert weights from decimals to percentages first
      const convertedAssets = (portfolio.assets || []).map(asset => ({
        ...asset,
        weight: (asset.weight || 0) * 100, // Convert 0.25 -> 25%
      }));

      // Then enrich with sector data like in CreationStepReview
      const enrichedData = await Promise.all(
        convertedAssets.map(async (asset) => {
          if (asset.sector) return asset;

          try {
            const assetInfo = await getAssetInfo(asset.ticker);
            return {
              ...asset,
              sector: assetInfo?.sector || 'Other'
            };
          } catch {
            return { ...asset, sector: 'Other' };
          }
        })
      );
      setEnrichedAssets(enrichedData);
    };

    enrichAssets();
  }, [portfolio.assets, getAssetInfo]);

  const portfolioValue = portfolio.startingAmount || portfolio.totalValue || 100000;
  const totalWeight = enrichedAssets.reduce((sum, asset) => sum + (asset.weight || 0), 0);
  const cashWeight = Math.max(0, 100 - totalWeight);

  return (
    <>
      {/* Portfolio Overview Section */}
      <div className={styles.reviewSummary}>
        <h3 className={styles.reviewSectionTitle}>Portfolio Overview</h3>

        <div className={styles.summaryCard}>
          <div className={styles.summaryCardTitle}>
            {portfolio.name}
          </div>
          <div className={styles.summaryDetails}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Starting Amount:</span>
              <span className={styles.summaryValue}>
                {formatCurrency(portfolioValue)}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Total Assets:</span>
              <span className={styles.summaryValue}>{enrichedAssets.length}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Total Weight:</span>
              <span className={styles.summaryValue}>
                {totalWeight.toFixed(1)}%
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Last Updated:</span>
              <span className={styles.summaryValue}>
                {portfolio.updatedAt ? formatDate(portfolio.updatedAt) : 'Never'}
              </span>
            </div>
          </div>

          {portfolio.description && (
            <div className={styles.summaryDescription}>
              {portfolio.description}
            </div>
          )}

          {portfolio.tags && portfolio.tags.length > 0 && (
            <div className={styles.modalTags}>
              <div className={styles.tagsContainer}>
                {portfolio.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" size="small">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Asset Allocation Section - EXACT SAME AS CreationStepReview */}
      <div className={styles.allocationSection}>
        <h3 className={styles.reviewSectionTitle}>Asset Allocation</h3>

        <div className={styles.allocationGrid}>
          {/* Asset Allocation Chart */}
          <div className={styles.chartContainer}>
            <h4 className={styles.chartTitle}>By Assets</h4>
            <div className={styles.allocationChart}>
              <PieChart
                data={[
                  // Top assets
                  ...enrichedAssets
                    .filter(asset => asset.weight && asset.weight > 0)
                    .sort((a, b) => (b.weight || 0) - (a.weight || 0))
                    .slice(0, 8)
                    .map((asset, index) => ({
                      name: asset.ticker,
                      value: asset.weight || 0,
                      color: getChartColor(index),
                    })),
                  // Remaining assets grouped as "Others"
                  ...(enrichedAssets.length > 8 ? [{
                    name: 'Others',
                    value: enrichedAssets
                      .slice(8)
                      .reduce((sum, asset) => sum + (asset.weight || 0), 0),
                    color: getChartColor(8),
                  }] : []),
                  // Cash if there's any
                  ...(cashWeight > 0 ? [{
                    name: 'Cash',
                    value: cashWeight,
                    color: '#6B7280',
                  }] : [])
                ]}
                height={300}
                showLegend={true}
                innerRadius={60}
                outerRadius={100}
              />
            </div>
          </div>

          {/* Sectors Chart - EXACT SAME LOGIC AS CreationStepReview */}
          <div className={styles.chartContainer}>
            <h4 className={styles.chartTitle}>By Sectors</h4>
            <div className={styles.allocationChart}>
              <PieChart
                data={[
                  // Group assets by sector
                  ...Object.entries(
                    enrichedAssets.reduce((acc, asset) => {
                      const sector = (asset.sector && asset.sector.trim() !== '') ? asset.sector : 'Other';
                      acc[sector] = (acc[sector] || 0) + asset.weight;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([sector, weight], index) => ({
                    name: sector,
                    value: weight,
                    color: getChartColor(index),
                  })),
                  // Add cash if there's any
                  ...(cashWeight > 0 ? [{
                    name: 'Cash',
                    value: cashWeight,
                    color: '#6B7280',
                  }] : [])
                ]}
                height={300}
                showLegend={true}
                innerRadius={60}
                outerRadius={100}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Current Portfolio Table */}
      <div className={styles.detailedTable}>
        <h3 className={styles.reviewSectionTitle}>
          Current Portfolio ({enrichedAssets.length} assets)
        </h3>

        <AssetTable
          assets={enrichedAssets}
          portfolioValue={portfolioValue}
          onEdit={undefined}
          onDelete={undefined}
          showActions={false}
          showPnL={false}
          loading={false}
          className={styles.assetsTable}
        />
      </div>

      {/* Cash Remaining Section */}
      {cashWeight > 0 && (
        <div className={styles.cashSection}>
          <h4 className={styles.reviewSectionTitle}>Cash Remaining</h4>
          <div className={styles.cashInfo}>
            <span className={styles.cashLabel}>Unallocated Cash:</span>
            <span className={styles.cashValue}>
              {formatCurrency((portfolioValue * cashWeight) / 100)} ({cashWeight.toFixed(1)}%)
            </span>
          </div>
        </div>
      )}

      {/* Portfolio Warnings */}
      {(totalWeight > 100 || totalWeight < 100) && (
        <div className={styles.warningSection}>
          <h4 className={styles.reviewSectionTitle}>Portfolio Warnings</h4>
          <div className={styles.warningList}>
            {totalWeight > 100 && (
              <div className={styles.warningItem}>
                Your portfolio is over-allocated by {((totalWeight - 100)).toFixed(1)}%.
                Consider reducing some positions.
              </div>
            )}
            {totalWeight < 100 && (
              <div className={styles.warningItem}>
                Your portfolio is under-allocated by {((100 - totalWeight)).toFixed(1)}%.
                Consider increasing positions or adding more assets.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Actions */}
      <div className={styles.modalActions}>
        <Button
          variant="secondary"
          onClick={onClose}
        >
          Close
        </Button>
        <Button
          variant="primary"
          onClick={onAnalyze}
        >
          📊 Analyze Portfolio
        </Button>
      </div>
    </>
  );
};

const PortfolioListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Redux selectors
  const portfoliosRaw = useSelector(selectPortfolios);
  const portfolios = Array.isArray(portfoliosRaw) ? portfoliosRaw : [];
  const loading = useSelector(selectPortfoliosLoading);
  const error = useSelector(selectPortfoliosError);
  const filters = useSelector(selectPortfolioFilters);
  const sort = useSelector(selectPortfolioSort);
  const stats = useSelector(selectPortfolioStats);

  // DEBUG logging
  console.log('🔍 PortfolioListPage - portfoliosRaw:', portfoliosRaw);
  console.log('🔍 PortfolioListPage - portfolios:', portfolios);
  console.log('🔍 PortfolioListPage - portfolios type:', typeof portfolios);

  // Local state
  const [searchValue, setSearchValue] = useState(filters?.search || '');
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioListItem | null>(null);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Success message from portfolio creation
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load portfolios on mount and handle success message from portfolio creation
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);

      if (location.state?.portfolioId) {
        console.log('Reloading portfolios after creation:', location.state.portfolioId);
        dispatch(loadPortfolios());
      }

      // Clear message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
      // Clear location state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname, dispatch]);

  // Filter and sort portfolios
  const filteredPortfolios = React.useMemo(() => {
    if (!Array.isArray(portfolios) || portfolios.length === 0) {
      return [];
    }
    const portfoliosArray = Array.isArray(portfolios) ? portfolios : [];
    let filtered = [...portfoliosArray];

    // Search filter
    if (searchValue.trim()) {
      const search = searchValue.toLowerCase();
      filtered = filtered.filter(portfolio =>
        portfolio.name.toLowerCase().includes(search) ||
        portfolio.description?.toLowerCase().includes(search) ||
        (Array.isArray(portfolio.tags) && portfolio.tags.some(tag => tag.toLowerCase().includes(search)))
      );
    }

    // Tags filter
    if (filters?.tags && filters.tags.length > 0) {
      filtered = filtered.filter(portfolio =>
        Array.isArray(portfolio.tags) && filters.tags.some(tag => portfolio.tags.includes(tag))
      );
    }

    // Asset count range filter
    if (filters?.assetCountRange) {
      const [min, max] = filters.assetCountRange;
      filtered = filtered.filter(portfolio =>
        portfolio.assetCount >= min && portfolio.assetCount <= max
      );
    }

    // Sort
    if (sort) {
      filtered.sort((a, b) => {
        const { field, direction } = sort;
        let aValue: any, bValue: any;

        switch (field) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'lastUpdated':
            aValue = new Date(a.lastUpdated);
            bValue = new Date(b.lastUpdated);
            break;
          case 'assetCount':
            aValue = a.assetCount;
            bValue = b.assetCount;
            break;
          default:
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
        }

        if (direction === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    }

    return filtered;
  }, [portfolios, searchValue, filters, sort]);

  // Покажем структуру первого портфеля для отладки
  console.log('🔍 Sample portfolio structure:', portfolios[0]);
  if (portfolios[0]) {
    console.log('🔍 Sample portfolio keys:', Object.keys(portfolios[0]));
    console.log('🔍 Sample portfolio full:', JSON.stringify(portfolios[0], null, 2));
  }
  // Handlers
  const handleCreatePortfolio = () => {
    navigate(ROUTES.PORTFOLIO.CREATE);
  };

  const handleViewPortfolio = async (portfolioId: string) => {
    console.log('🔍 Loading portfolio from list:', portfolioId);

    const portfolio = portfolios.find(p => p.id === portfolioId);
    if (!portfolio) {
      console.error('❌ Portfolio not found:', portfolioId);
      return;
    }

    console.log('🔍 Base portfolio:', portfolio);
    console.log('🔍 Portfolio.assets:', portfolio.assets);
    console.log('🔍 Portfolio.startingAmount:', portfolio.startingAmount);
    console.log('🔍 Portfolio.totalValue:', portfolio.totalValue);
    console.log('🔍 All portfolio keys:', Object.keys(portfolio));

    // ВРЕМЕННАЯ ОТЛАДКА: Покажем весь объект
    console.log('🔍 FULL PORTFOLIO OBJECT:');
    console.log(JSON.stringify(portfolio, null, 2));

    setSelectedPortfolio(portfolio);
    setShowPortfolioModal(true);
  };

  const handleAnalyzePortfolio = (portfolioId: string) => {
    navigate(ROUTES.PORTFOLIO.ANALYSIS_PATH(portfolioId));  // Правильный роут
  };

  const handleEditPortfolio = (portfolioId: string) => {
    navigate(ROUTES.PORTFOLIO.EDIT_PATH(portfolioId));
    // Альтернативно: navigate(`/portfolios/${portfolioId}/edit`);
  };

  const handleDeletePortfolio = (portfolioId: string) => {
    setDeleteConfirmId(portfolioId);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      console.log('Deleting portfolio:', deleteConfirmId);

      // ИСПРАВЛЕНО: Используем реальный API вызов через Redux action
      await dispatch(deletePortfolio({ id: deleteConfirmId }));

      // Закрыть модальное окно подтверждения
      setDeleteConfirmId(null);

      // Показать сообщение об успехе
      setSuccessMessage('Portfolio deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);

      console.log('Portfolio deleted successfully:', deleteConfirmId);

    } catch (error) {
      console.error('Error deleting portfolio:', error);

      // Закрыть модальное окно даже при ошибке
      setDeleteConfirmId(null);

      // Показать сообщение об ошибке
      setSuccessMessage('Failed to delete portfolio. Please try again.');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    dispatch(setPortfolioFilters({ search: e.target.value }));
  };

  const handleRefresh = () => {
    dispatch(loadPortfolios());
  };

  const sortOptions = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'lastUpdated-desc', label: 'Recently Updated' },
    { value: 'lastUpdated-asc', label: 'Oldest Updated' },
    { value: 'assetCount-desc', label: 'Most Assets' },
    { value: 'assetCount-asc', label: 'Fewest Assets' },
  ];

  const currentSortValue = sort ? `${sort.field}-${sort.direction}` : 'lastUpdated-desc';

  const handleSortChange = (value: string) => {
    const [field, direction] = value.split('-') as [PortfolioSort['field'], PortfolioSort['direction']];
    dispatch(setPortfolioSort({ field, direction }));
  };

  return (
    <PageContainer>
      <div className={styles.container}>
        {/* Success Message */}
        {successMessage && (
          <div className={styles.successMessage}>
            <div className={styles.successContent}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20,6 9,17 4,12" />
              </svg>
              {successMessage}
            </div>
          </div>
        )}

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>All Portfolios</h1>
            <p className={styles.subtitle}>
              Manage and analyze your investment portfolios
            </p>
          </div>

          <div className={styles.actions}>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
            </Button>
            <Button onClick={handleCreatePortfolio}>
              ➕ Create Portfolio
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className={styles.statsGrid}>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{stats.totalPortfolios}</div>
              <div className={styles.statLabel}>Total Portfolios</div>
            </div>
          </Card>

          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{stats.totalAssets}</div>
              <div className={styles.statLabel}>Total Assets</div>
            </div>
          </Card>

          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{stats.avgAssetsPerPortfolio}</div>
              <div className={styles.statLabel}>Avg Assets</div>
            </div>
          </Card>

          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statValue}>
                {stats.lastUpdated ? formatDate(stats.lastUpdated, 'short') : 'Never'}
              </div>
              <div className={styles.statLabel}>Last Updated</div>
            </div>
          </Card>
        </div>

        {/* Controls */}
        <Card className={styles.controlsCard}>
          <div className={styles.controls}>
            <div className={styles.searchSection}>
              <Input
                type="search"
                placeholder="Search portfolios..."
                value={searchValue}
                onChange={handleSearchChange}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.filterSection}>
              <Select
                value={currentSortValue}
                onChange={handleSortChange}
                options={sortOptions}
                placeholder="Sort by..."
                className={styles.sortSelect}
              />
            </div>
          </div>
        </Card>

        {/* Content */}
        <div className={styles.content}>
          {error ? (
            <Card className={styles.errorCard}>
              <div className={styles.errorContent}>
                <h3>❌ Error Loading Portfolios</h3>
                <p>{error}</p>
                <Button onClick={handleRefresh} variant="outline">
                  Try Again
                </Button>
              </div>
            </Card>
          ) : loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Loading portfolios...</p>
            </div>
          ) : filteredPortfolios.length === 0 ? (
            <Card className={styles.emptyCard}>
              <div className={styles.emptyContent}>
                {searchValue ? (
                  <>
                    <h3>🔍 No portfolios found</h3>
                    <p>Try adjusting your search criteria</p>
                    <Button onClick={() => setSearchValue('')} variant="outline">
                      Clear Search
                    </Button>
                  </>
                ) : (
                  <>
                    <h3>📊 No portfolios yet</h3>
                    <p>Create your first portfolio to get started</p>
                    <Button onClick={handleCreatePortfolio}>
                      Create Your First Portfolio
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ) : (
            <div className={styles.portfoliosGrid}>
              {filteredPortfolios.map((portfolio) => (
                <Card key={portfolio.id} className={styles.portfolioCard}>
                  <div className={styles.portfolioHeader}>
                    <div className={styles.portfolioInfo}>
                      <h3 className={styles.portfolioName}>{portfolio.name}</h3>
                      {portfolio.description && (
                        <p className={styles.portfolioDescription}>
                          {portfolio.description}
                        </p>
                      )}
                    </div>
                    <div className={styles.portfolioBadges}>
                      <Badge variant="secondary">
                        {portfolio.assetCount} assets
                      </Badge>
                    </div>
                  </div>

                  <div className={styles.portfolioMeta}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Last Updated:</span>
                      <span className={styles.metaValue}>
                        {formatDate(portfolio.lastUpdated, 'short')}
                      </span>
                    </div>
                  </div>

                  {Array.isArray(portfolio.tags) && portfolio.tags.length > 0 && (
                    <div className={styles.portfolioTags}>
                      {portfolio.tags.map((tag) => (
                        <Badge key={tag} variant="outline" size="small">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className={styles.portfolioActions}>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handleViewPortfolio(portfolio.id)}
                    >
                      👁️ View
                    </Button>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handleAnalyzePortfolio(portfolio.id)}
                    >
                      📊 Analyze
                    </Button>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handleEditPortfolio(portfolio.id)}
                    >
                      ✏️ Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handleDeletePortfolio(portfolio.id)}
                      className={styles.deleteButton}
                    >
                      🗑️ Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Portfolio View Modal - USING REAL SECTOR LOGIC */}
        {showPortfolioModal && selectedPortfolio && (
          <Modal
            isOpen={showPortfolioModal}
            onClose={() => setShowPortfolioModal(false)}
            title="Portfolio Overview"
            size="large"
            className={styles.portfolioModal}
          >
            <div className={styles.modalContent}>
              <PortfolioViewContent
                portfolio={selectedPortfolio}
                onClose={() => setShowPortfolioModal(false)}
                onAnalyze={() => {
                  setShowPortfolioModal(false);
                  navigate(`/portfolios/${selectedPortfolio.id}/analysis`);
                }}
              />
            </div>
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <Modal
            isOpen={Boolean(deleteConfirmId)}
            onClose={() => setDeleteConfirmId(null)}
            title="Delete Portfolio"
            size="small"
          >
            <div className={styles.confirmContent}>
              <p>
                Are you sure you want to delete this portfolio? This action cannot be undone.
              </p>
              <div className={styles.confirmActions}>
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirmId(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDelete}
                  className={styles.deleteButton}
                >
                  🗑️ Delete Portfolio
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </PageContainer>
  );
};

export default PortfolioListPage;