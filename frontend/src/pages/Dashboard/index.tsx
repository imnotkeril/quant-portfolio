// Beautiful Dashboard Component - index.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './Dashboard.module.css';

interface Portfolio {
  id: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  assets: number;
}

interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [portfolios] = useState<Portfolio[]>([
    {
      id: '1',
      name: 'Growth Portfolio',
      value: 125420.87,
      change: 2341.23,
      changePercent: 1.91,
      assets: 12
    },
    {
      id: '2',
      name: 'Conservative Portfolio',
      value: 89650.45,
      change: 456.78,
      changePercent: 0.51,
      assets: 8
    },
    {
      id: '3',
      name: 'Tech Focus',
      value: 67890.12,
      change: -1234.56,
      changePercent: -1.78,
      assets: 15
    }
  ]);

  const [marketData] = useState<MarketIndex[]>([
    {
      name: 'S&P 500',
      value: 4558.87,
      change: 81.23,
      changePercent: 1.81
    },
    {
      name: 'NASDAQ',
      value: 15848.0,
      change: 233.45,
      changePercent: 1.50
    },
    {
      name: 'Dow Jones',
      value: 34786.45,
      change: 156.78,
      changePercent: 0.45
    },
    {
      name: 'VIX',
      value: 18.42,
      change: -0.67,
      changePercent: -3.50
    }
  ]);

  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const performanceData = [
    { name: 'Jan', portfolio: 98000, benchmark: 95000 },
    { name: 'Feb', portfolio: 102000, benchmark: 97000 },
    { name: 'Mar', portfolio: 108000, benchmark: 101000 },
    { name: 'Apr', portfolio: 105000, benchmark: 103000 },
    { name: 'May', portfolio: 115000, benchmark: 108000 },
    { name: 'Jun', portfolio: 125000, benchmark: 112000 },
  ];

  const quickActions = [
    {
      id: 'create-portfolio',
      title: 'Create Portfolio',
      description: 'Build a new investment portfolio',
      icon: '📊',
      action: () => navigate('/portfolio/create')
    },
    {
      id: 'market-analysis',
      title: 'Market Analysis',
      description: 'Explore market insights',
      icon: '📈',
      action: () => navigate('/analytics')
    },
    {
      id: 'risk-assessment',
      title: 'Risk Assessment',
      description: 'Analyze portfolio risks',
      icon: '⚖️',
      action: () => navigate('/risk')
    },
    {
      id: 'optimization',
      title: 'Optimization',
      description: 'Optimize allocations',
      icon: '⚡',
      action: () => navigate('/optimization')
    }
  ];

  const handleCreatePortfolio = () => {
    navigate('/portfolios/create');
  };

  const handleExploreDemo = () => {
    navigate('/analytics');
  };

  const handlePortfolioClick = (portfolioId: string) => {
    setSelectedPortfolio(portfolioId);
    navigate(`/portfolio/${portfolioId}`);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className={styles.dashboard}>
      {/* Welcome Section */}
      <div className={styles.welcomeSection}>
        <div className={styles.welcomeCard}>
          <h1 className={styles.welcomeTitle}>Welcome to Portfolio Management</h1>
          <p className={styles.welcomeText}>
            Discover advanced portfolio analysis, enhance your portfolio
            performance, optimize allocations, and manage risk with our
            comprehensive suite of professional tools.
          </p>
          <div className={styles.welcomeActions}>
            <button className={styles.primaryButton} onClick={handleCreatePortfolio}>
              <span>Create Your First Portfolio</span>
            </button>
            <button className={styles.secondaryButton} onClick={handleExploreDemo}>
              <span>Explore Demo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className={styles.content}>
        {/* Left Panel */}
        <div className={styles.leftPanel}>
          {/* Your Portfolios */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Your Portfolios</h2>
            <div className={styles.sectionContent}>
              {portfolios.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📊</div>
                  <h3 className={styles.emptyTitle}>No Portfolios Yet</h3>
                  <p className={styles.emptyText}>
                    Create your first portfolio to start tracking and optimizing your investments.
                  </p>
                  <button className={styles.createButton} onClick={handleCreatePortfolio}>
                    Create Portfolio
                  </button>
                </div>
              ) : (
                <div className={styles.portfolioGrid}>
                  {portfolios.map((portfolio) => (
                    <div
                      key={portfolio.id}
                      className={styles.portfolioCard}
                      onClick={() => handlePortfolioClick(portfolio.id)}
                    >
                      <div className={styles.portfolioHeader}>
                        <div>
                          <h3 className={styles.portfolioName}>{portfolio.name}</h3>
                          <p style={{
                            fontSize: 'var(--font-size-caption)',
                            color: 'var(--color-neutral-gray)',
                            margin: '4px 0 0 0'
                          }}>
                            {portfolio.assets} assets
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div className={styles.portfolioValue}>
                            {formatCurrency(portfolio.value)}
                          </div>
                          <div className={`${styles.portfolioChange} ${
                            portfolio.change >= 0 ? styles.positive : styles.negative
                          }`}>
                            {formatCurrency(Math.abs(portfolio.change))}
                            ({formatPercentage(portfolio.changePercent)})
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Performance Chart */}
          {portfolios.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Portfolio Performance</h2>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-divider)" />
                    <XAxis
                      dataKey="name"
                      stroke="var(--color-neutral-gray)"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="var(--color-neutral-gray)"
                      fontSize={12}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card-background)',
                        border: '1px solid var(--color-divider)',
                        borderRadius: 'var(--border-radius-s)',
                        color: 'var(--color-text-light)',
                        fontSize: 'var(--font-size-body)'
                      }}
                      formatter={(value: any) => [formatCurrency(value), '']}
                    />
                    <Line
                      type="monotone"
                      dataKey="portfolio"
                      stroke="var(--color-accent)"
                      strokeWidth={3}
                      dot={{ fill: 'var(--color-accent)', strokeWidth: 2, r: 5 }}
                      name="Portfolio"
                    />
                    <Line
                      type="monotone"
                      dataKey="benchmark"
                      stroke="var(--color-neutral-1)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: 'var(--color-neutral-1)', strokeWidth: 2, r: 4 }}
                      name="Benchmark"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className={styles.rightPanel}>
          {/* Quick Actions */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Quick Actions</h2>
            <div className={styles.actionGrid}>
              {quickActions.map((action) => (
                <div
                  key={action.id}
                  className={styles.actionCard}
                  onClick={action.action}
                >
                  <div className={styles.actionIcon}>{action.icon}</div>
                  <h3 className={styles.actionTitle}>{action.title}</h3>
                  <p className={styles.actionDescription}>{action.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Market Overview */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Market Overview</h2>
            <div className={styles.marketGrid}>
              {marketData.map((market) => (
                <div key={market.name} className={styles.marketCard}>
                  <div className={styles.marketName}>{market.name}</div>
                  <div className={styles.marketValue}>
                    {formatNumber(market.value)}
                  </div>
                  <div className={`${styles.marketChange} ${
                    market.change >= 0 ? styles.positive : styles.negative
                  }`}>
                    {market.change >= 0 ? '+' : ''}
                    {formatNumber(Math.abs(market.change))}
                    ({formatPercentage(market.changePercent)})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;