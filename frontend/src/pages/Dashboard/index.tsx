// src/pages/Dashboard/index.tsx
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

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [portfolios] = useState<Portfolio[]>([
    {
      id: '1',
      name: 'S&P 500',
      value: 4558.87,
      change: 81.23,
      changePercent: 1.81
    },
    {
      id: '2',
      name: 'NASDAQ',
      value: 15848.0,
      change: 233.45,
      changePercent: 1.50
    },
    {
      id: '3',
      name: 'Dow Jones',
      value: 34786.45,
      change: 156.78,
      changePercent: 0.45
    },
    {
      id: '4',
      name: 'VIX',
      value: 18.42,
      change: -0.67,
      changePercent: -3.50
    }
  ]);

  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null);

  const performanceData = [
    { name: 'Jan', portfolio: 4000, benchmark: 3000 },
    { name: 'Feb', portfolio: 3000, benchmark: 2000 },
    { name: 'Mar', portfolio: 5000, benchmark: 4000 },
    { name: 'Apr', portfolio: 4500, benchmark: 3800 },
    { name: 'May', portfolio: 6000, benchmark: 5000 },
    { name: 'Jun', portfolio: 8000, benchmark: 6000 },
  ];

  const handleCreatePortfolio = () => {
    navigate('/portfolio/create');
  };

  const handleExploreDemo = () => {
    // Идем на Analytics (PortfolioAnalysis)
    navigate('/analytics');
  };

  const handlePortfolioClick = (portfolioId: string) => {
    setSelectedPortfolio(portfolioId);
  };

  return (
    <div className={styles.dashboard}>
      {/* Welcome Section */}
      <div className={styles.welcomeSection}>
        <div className={styles.welcomeCard}>
          <h2 className={styles.welcomeTitle}>Welcome to Portfolio Management</h2>
          <p className={styles.welcomeText}>
            Discover advanced portfolio analysis, enhance your portfolio
            performance, optimize allocations, and manage risk with our
            comprehensive tools.
          </p>
          <div className={styles.welcomeActions}>
            <button className={styles.primaryButton} onClick={handleCreatePortfolio}>
              Create Your First Portfolio
            </button>
            <button className={styles.secondaryButton} onClick={handleExploreDemo}>
              Explore Demo
            </button>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className={styles.content}>
        {/* Left Panel - Portfolios */}
        <div className={styles.leftPanel}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Your Portfolios</h3>
            <div className={styles.portfolioGrid}>
              {portfolios.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📊</div>
                  <p className={styles.emptyText}>No portfolios yet</p>
                  <button className={styles.createButton} onClick={handleCreatePortfolio}>
                    Create Portfolio
                  </button>
                </div>
              ) : (
                portfolios.map((portfolio) => (
                  <div
                    key={portfolio.id}
                    className={`${styles.portfolioCard} ${selectedPortfolio === portfolio.id ? styles.selected : ''}`}
                    onClick={() => handlePortfolioClick(portfolio.id)}
                  >
                    <div className={styles.portfolioHeader}>
                      <h4 className={styles.portfolioName}>{portfolio.name}</h4>
                    </div>
                    <div className={styles.portfolioValue}>
                      ${portfolio.value.toLocaleString()}
                    </div>
                    <div className={styles.portfolioChange}>
                      <span className={portfolio.change >= 0 ? styles.positive : styles.negative}>
                        {portfolio.change >= 0 ? '+' : ''}
                        ${Math.abs(portfolio.change).toFixed(2)} ({portfolio.changePercent}%)
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Cards */}
          <div className={styles.actionGrid}>
            <div className={styles.actionCard} onClick={handleCreatePortfolio}>
              <div className={styles.actionIcon}>+</div>
              <div className={styles.actionText}>
                <div className={styles.actionTitle}>Create Portfolio</div>
                <div className={styles.actionDesc}>Build new portfolio</div>
              </div>
            </div>

            <div className={styles.actionCard}>
              <div className={styles.actionIcon}>📈</div>
              <div className={styles.actionText}>
                <div className={styles.actionTitle}>Market Analysis</div>
                <div className={styles.actionDesc}>View market insights</div>
              </div>
            </div>

            <div className={styles.actionCard}>
              <div className={styles.actionIcon}>⚖️</div>
              <div className={styles.actionText}>
                <div className={styles.actionTitle}>Risk Assessment</div>
                <div className={styles.actionDesc}>Analyze portfolio risk</div>
              </div>
            </div>

            <div className={styles.actionCard}>
              <div className={styles.actionIcon}>📊</div>
              <div className={styles.actionText}>
                <div className={styles.actionTitle}>Performance</div>
                <div className={styles.actionDesc}>Track performance</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Market Overview */}
        <div className={styles.rightPanel}>
          <div className={styles.marketOverview}>
            <h3 className={styles.sectionTitle}>Market Overview</h3>
            <div className={styles.marketCards}>
              {portfolios.map((portfolio) => (
                <div key={portfolio.id} className={styles.marketCard}>
                  <div className={styles.marketName}>{portfolio.name}</div>
                  <div className={styles.marketValue}>
                    ${portfolio.value.toLocaleString()}
                  </div>
                  <div className={`${styles.marketChange} ${portfolio.change >= 0 ? styles.positive : styles.negative}`}>
                    {portfolio.change >= 0 ? '+' : ''}${Math.abs(portfolio.change).toFixed(2)} ({portfolio.changePercent}%)
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Chart */}
          {selectedPortfolio && (
            <div className={styles.chartSection}>
              <h3 className={styles.sectionTitle}>Portfolio Performance</h3>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2E39" />
                    <XAxis
                      dataKey="name"
                      stroke="#D1D4DC"
                      fontSize={10}
                    />
                    <YAxis
                      stroke="#D1D4DC"
                      fontSize={10}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1A1E2A',
                        border: '1px solid #2A2E39',
                        borderRadius: '8px',
                        color: '#FFFFFF'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="portfolio"
                      stroke="#BF9FFB"
                      strokeWidth={2}
                      dot={{ fill: '#BF9FFB', strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="benchmark"
                      stroke="#90BFF9"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: '#90BFF9', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;