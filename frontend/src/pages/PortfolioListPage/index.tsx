/**
 * Portfolio List Page Component
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
import { loadPortfolios } from '../../store/portfolio/actions';
import {
  selectPortfolios,
  selectPortfoliosLoading,
  selectPortfoliosError,
  selectPortfolioFilters,
  selectPortfolioSort,
} from '../../store/portfolio/selectors';
import { setPortfolioFilters, setPortfolioSort } from '../../store/portfolio/reducer';
import { PortfolioListItem } from '../../types/portfolio';
import { PortfolioFilters, PortfolioSort } from '../../store/portfolio/types';
import { ROUTES } from '../../constants/routes';
import { formatDate } from '../../utils/formatters';
import styles from './styles.module.css';

const PortfolioListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Redux selectors
  const portfolios = useSelector(selectPortfolios);
  const loading = useSelector(selectPortfoliosLoading);
  const error = useSelector(selectPortfoliosError);
  const filters = useSelector(selectPortfolioFilters);
  const sort = useSelector(selectPortfolioSort);

  // Local state
  const [searchValue, setSearchValue] = useState(filters?.search || '');
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioListItem | null>(null);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Success message from portfolio creation
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load portfolios on mount
  useEffect(() => {
    dispatch(loadPortfolios());
  }, [dispatch]);

  // Handle success message from portfolio creation
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
      // Clear location state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Filter and sort portfolios
  const filteredPortfolios = React.useMemo(() => {
    let filtered = [...portfolios];

    // Search filter
    if (searchValue.trim()) {
      const search = searchValue.toLowerCase();
      filtered = filtered.filter(portfolio =>
        portfolio.name.toLowerCase().includes(search) ||
        portfolio.description?.toLowerCase().includes(search) ||
        portfolio.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }

    // Tags filter
    if (filters?.tags && filters.tags.length > 0) {
      filtered = filtered.filter(portfolio =>
        filters.tags.some(tag => portfolio.tags.includes(tag))
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

  // Handlers
  const handleCreatePortfolio = () => {
    navigate(ROUTES.PORTFOLIO.CREATE);
  };

  const handleViewPortfolio = (portfolioId: string) => {
    const portfolio = portfolios.find(p => p.id === portfolioId);
    if (portfolio) {
      setSelectedPortfolio(portfolio);
      setShowPortfolioModal(true);
    }
  };

  const handleAnalyzePortfolio = (portfolioId: string) => {
    navigate(`/portfolio/analyze/${portfolioId}`);
  };

  const handleEditPortfolio = (portfolioId: string) => {
    navigate(`/portfolio/edit/${portfolioId}`);
  };

  const handleDeletePortfolio = (portfolioId: string) => {
    setDeleteConfirmId(portfolioId);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      // Here you would dispatch delete action
      console.log('Deleting portfolio:', deleteConfirmId);
      // await dispatch(deletePortfolio({ id: deleteConfirmId }));
      setDeleteConfirmId(null);
      dispatch(loadPortfolios()); // Reload after deletion
    } catch (error) {
      console.error('Error deleting portfolio:', error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    dispatch(setPortfolioFilters({ search: e.target.value }));
  };

  const handleRefresh = () => {
    dispatch(loadPortfolios());
  };

  // Statistics
  const totalPortfolios = portfolios.length;
  const totalAssets = portfolios.reduce((sum, p) => sum + p.assetCount, 0);
  const avgAssetsPerPortfolio = totalPortfolios > 0 ? Math.round(totalAssets / totalPortfolios) : 0;
  const lastUpdated = portfolios.length > 0
    ? portfolios.reduce((latest, p) =>
        new Date(p.lastUpdated) > new Date(latest.lastUpdated) ? p : latest
      ).lastUpdated
    : null;

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
              <div className={styles.statValue}>{totalPortfolios}</div>
              <div className={styles.statLabel}>Total Portfolios</div>
            </div>
          </Card>

          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{totalAssets}</div>
              <div className={styles.statLabel}>Total Assets</div>
            </div>
          </Card>

          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{avgAssetsPerPortfolio}</div>
              <div className={styles.statLabel}>Avg Assets</div>
            </div>
          </Card>

          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statValue}>
                {lastUpdated ? formatDate(lastUpdated, 'short') : 'Never'}
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

                  {portfolio.tags.length > 0 && (
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

        {/* Portfolio View Modal */}
        {showPortfolioModal && selectedPortfolio && (
          <Modal
            isOpen={showPortfolioModal}
            onClose={() => setShowPortfolioModal(false)}
            title={selectedPortfolio.name}
            size="large"
          >
            <div className={styles.modalContent}>
              <div className={styles.portfolioDetails}>
                <h4>Portfolio Details</h4>
                <div className={styles.detailsGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Name:</span>
                    <span className={styles.detailValue}>{selectedPortfolio.name}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Description:</span>
                    <span className={styles.detailValue}>
                      {selectedPortfolio.description || 'No description'}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Assets:</span>
                    <span className={styles.detailValue}>{selectedPortfolio.assetCount}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Last Updated:</span>
                    <span className={styles.detailValue}>
                      {formatDate(selectedPortfolio.lastUpdated, 'full')}
                    </span>
                  </div>
                </div>

                {selectedPortfolio.tags.length > 0 && (
                  <div className={styles.modalTags}>
                    <span className={styles.detailLabel}>Tags:</span>
                    <div className={styles.tagsContainer}>
                      {selectedPortfolio.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" size="small">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.modalActions}>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPortfolioModal(false);
                    handleAnalyzePortfolio(selectedPortfolio.id);
                  }}
                >
                  📊 Analyze Portfolio
                </Button>
                <Button
                  onClick={() => {
                    setShowPortfolioModal(false);
                    handleEditPortfolio(selectedPortfolio.id);
                  }}
                >
                  ✏️ Edit Portfolio
                </Button>
              </div>
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