// src/pages/Analytics/index.tsx
import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import styles from './Analytics.module.css';

interface AnalyticsData {
  performance: Array<{
    date: string;
    portfolio: number;
    benchmark: number;
    volume: number;
  }>;
  allocation: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  riskMetrics: {
    volatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
    var95: number;
    beta: number;
    alpha: number;
  };
  topHoldings: Array<{
    symbol: string;
    name: string;
    weight: number;
    return: number;
    price: number;
  }>;
}

const Analytics: React.FC = () => {
  const [timeframe, setTimeframe] = useState('1Y');
  const [selectedMetric, setSelectedMetric] = useState('performance');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - в реальном приложении это будет загружаться с API
  const [analyticsData] = useState<AnalyticsData>({
    performance: [
      { date: '2024-01', portfolio: 100000, benchmark: 98000, volume: 1200000 },
      { date: '2024-02', portfolio: 105000, benchmark: 101000, volume: 1350000 },
      { date: '2024-03', portfolio: 98000, benchmark: 96000, volume: 1100000 },
      { date: '2024-04', portfolio: 112000, benchmark: 107000, volume: 1450000 },
      { date: '2024-05', portfolio: 118000, benchmark: 112000, volume: 1600000 },
      { date: '2024-06', portfolio: 125000, benchmark: 118000, volume: 1750000 },
      { date: '2024-07', portfolio: 120000, benchmark: 115000, volume: 1650000 },
      { date: '2024-08', portfolio: 128000, benchmark: 121000, volume: 1800000 },
      { date: '2024-09', portfolio: 132000, benchmark: 125000, volume: 1900000 },
      { date: '2024-10', portfolio: 135000, benchmark: 128000, volume: 2000000 },
      { date: '2024-11', portfolio: 142000, benchmark: 134000, volume: 2100000 },
      { date: '2024-12', portfolio: 148000, benchmark: 138000, volume: 2200000 },
    ],
    allocation: [
      { name: 'Technology', value: 35, color: '#BF9FFB' },
      { name: 'Healthcare', value: 20, color: '#74F174' },
      { name: 'Finance', value: 15, color: '#90BFF9' },
      { name: 'Consumer', value: 12, color: '#FFF59D' },
      { name: 'Energy', value: 10, color: '#FAA1A4' },
      { name: 'Materials', value: 8, color: '#D1D4DC' },
    ],
    riskMetrics: {
      volatility: 18.5,
      sharpeRatio: 1.25,
      maxDrawdown: -12.3,
      var95: -8.7,
      beta: 1.15,
      alpha: 2.8
    },
    topHoldings: [
      { symbol: 'AAPL', name: 'Apple Inc.', weight: 8.5, return: 15.2, price: 185.25 },
      { symbol: 'MSFT', name: 'Microsoft Corp.', weight: 7.8, return: 22.1, price: 348.50 },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', weight: 6.2, return: 18.7, price: 142.80 },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', weight: 5.9, return: 12.4, price: 151.20 },
      { symbol: 'TSLA', name: 'Tesla Inc.', weight: 4.3, return: 28.9, price: 248.75 },
      { symbol: 'NVDA', name: 'NVIDIA Corp.', weight: 4.1, return: 45.6, price: 725.30 },
      { symbol: 'META', name: 'Meta Platforms', weight: 3.8, return: 31.2, price: 325.15 },
      { symbol: 'NFLX', name: 'Netflix Inc.', weight: 2.9, return: 19.8, price: 485.60 },
    ]
  });

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeframe]);

  const timeframes = [
    { value: '1D', label: '1 Day' },
    { value: '1W', label: '1 Week' },
    { value: '1M', label: '1 Month' },
    { value: '3M', label: '3 Months' },
    { value: '6M', label: '6 Months' },
    { value: '1Y', label: '1 Year' },
    { value: 'ALL', label: 'All Time' }
  ];

  const metrics = [
    { value: 'performance', label: 'Performance', icon: '📈' },
    { value: 'risk', label: 'Risk Analysis', icon: '⚠️' },
    { value: 'allocation', label: 'Allocation', icon: '🥧' },
    { value: 'holdings', label: 'Holdings', icon: '📊' }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number, decimals = 1) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
  };

  if (isLoading) {
    return (
      <div className={styles.analytics}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <div className={styles.loadingText}>Loading Analytics Dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.analytics}>
      {/* Header Controls */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.pageTitle}>Analytics Dashboard</h1>
          <p className={styles.subtitle}>Comprehensive portfolio analysis and insights</p>
        </div>

        <div className={styles.controls}>
          <div className={styles.timeframeSelector}>
            {timeframes.map((tf) => (
              <button
                key={tf.value}
                className={`${styles.timeframeButton} ${timeframe === tf.value ? styles.active : ''}`}
                onClick={() => setTimeframe(tf.value)}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Navigation */}
      <div className={styles.metricsNav}>
        {metrics.map((metric) => (
          <button
            key={metric.value}
            className={`${styles.metricButton} ${selectedMetric === metric.value ? styles.active : ''}`}
            onClick={() => setSelectedMetric(metric.value)}
          >
            <span className={styles.metricIcon}>{metric.icon}</span>
            <span className={styles.metricLabel}>{metric.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {selectedMetric === 'performance' && (
          <div className={styles.performanceSection}>
            {/* Performance Chart */}
            <div className={styles.chartCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Portfolio Performance</h3>
                <div className={styles.cardSubtitle}>vs Benchmark Comparison</div>
              </div>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={analyticsData.performance}>
                    <defs>
                      <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#BF9FFB" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#BF9FFB" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="benchmarkGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#90BFF9" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#90BFF9" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2E39" />
                    <XAxis
                      dataKey="date"
                      stroke="#D1D4DC"
                      fontSize={10}
                    />
                    <YAxis
                      stroke="#D1D4DC"
                      fontSize={10}
                      tickFormatter={formatCurrency}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1A1E2A',
                        border: '1px solid #2A2E39',
                        borderRadius: '8px',
                        color: '#FFFFFF'
                      }}
                      formatter={(value: number, name: string) => [
                        formatCurrency(value),
                        name === 'portfolio' ? 'Portfolio' : 'Benchmark'
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="portfolio"
                      stroke="#BF9FFB"
                      strokeWidth={2}
                      fill="url(#portfolioGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="benchmark"
                      stroke="#90BFF9"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      fill="url(#benchmarkGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Performance Stats */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Total Return</div>
                <div className={styles.statValue}>+48.0%</div>
                <div className={styles.statChange}>+2.8% vs benchmark</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Annualized Return</div>
                <div className={styles.statValue}>+15.2%</div>
                <div className={styles.statChange}>+1.9% vs benchmark</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Current Value</div>
                <div className={styles.statValue}>$148,000</div>
                <div className={styles.statChange}>+$48,000 gain</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Best Month</div>
                <div className={styles.statValue}>+12.8%</div>
                <div className={styles.statChange}>April 2024</div>
              </div>
            </div>
          </div>
        )}

        {selectedMetric === 'risk' && (
          <div className={styles.riskSection}>
            <div className={styles.riskGrid}>
              {/* Risk Metrics */}
              <div className={styles.riskMetricsCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>Risk Metrics</h3>
                </div>
                <div className={styles.riskMetrics}>
                  <div className={styles.riskMetric}>
                    <div className={styles.metricName}>Volatility</div>
                    <div className={styles.metricValue}>{analyticsData.riskMetrics.volatility}%</div>
                  </div>
                  <div className={styles.riskMetric}>
                    <div className={styles.metricName}>Sharpe Ratio</div>
                    <div className={styles.metricValue}>{analyticsData.riskMetrics.sharpeRatio}</div>
                  </div>
                  <div className={styles.riskMetric}>
                    <div className={styles.metricName}>Max Drawdown</div>
                    <div className={`${styles.metricValue} ${styles.negative}`}>
                      {analyticsData.riskMetrics.maxDrawdown}%
                    </div>
                  </div>
                  <div className={styles.riskMetric}>
                    <div className={styles.metricName}>VaR (95%)</div>
                    <div className={`${styles.metricValue} ${styles.negative}`}>
                      {analyticsData.riskMetrics.var95}%
                    </div>
                  </div>
                  <div className={styles.riskMetric}>
                    <div className={styles.metricName}>Beta</div>
                    <div className={styles.metricValue}>{analyticsData.riskMetrics.beta}</div>
                  </div>
                  <div className={styles.riskMetric}>
                    <div className={styles.metricName}>Alpha</div>
                    <div className={`${styles.metricValue} ${styles.positive}`}>
                      {formatPercentage(analyticsData.riskMetrics.alpha)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Volume Chart */}
              <div className={styles.volumeCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>Trading Volume</h3>
                </div>
                <div className={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.performance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A2E39" />
                      <XAxis
                        dataKey="date"
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
                      <Bar
                        dataKey="volume"
                        fill="#D1D4DC"
                        opacity={0.8}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedMetric === 'allocation' && (
          <div className={styles.allocationSection}>
            <div className={styles.allocationGrid}>
              {/* Pie Chart */}
              <div className={styles.pieChartCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>Asset Allocation</h3>
                </div>
                <div className={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={analyticsData.allocation}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={150}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {analyticsData.allocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1A1E2A',
                          border: '1px solid #2A2E39',
                          borderRadius: '8px',
                          color: '#FFFFFF'
                        }}
                        formatter={(value: number) => [`${value}%`, 'Allocation']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Allocation List */}
              <div className={styles.allocationListCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>Sector Breakdown</h3>
                </div>
                <div className={styles.allocationList}>
                  {analyticsData.allocation.map((item, index) => (
                    <div key={index} className={styles.allocationItem}>
                      <div className={styles.allocationHeader}>
                        <div
                          className={styles.allocationColor}
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <div className={styles.allocationName}>{item.name}</div>
                        <div className={styles.allocationPercent}>{item.value}%</div>
                      </div>
                      <div className={styles.allocationBar}>
                        <div
                          className={styles.allocationFill}
                          style={{
                            width: `${item.value}%`,
                            backgroundColor: item.color
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedMetric === 'holdings' && (
          <div className={styles.holdingsSection}>
            <div className={styles.holdingsCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Top Holdings</h3>
                <div className={styles.cardSubtitle}>Largest positions by weight</div>
              </div>
              <div className={styles.holdingsTable}>
                <div className={styles.tableHeader}>
                  <div className={styles.headerCell}>Symbol</div>
                  <div className={styles.headerCell}>Name</div>
                  <div className={styles.headerCell}>Weight</div>
                  <div className={styles.headerCell}>Return</div>
                  <div className={styles.headerCell}>Price</div>
                </div>
                <div className={styles.tableBody}>
                  {analyticsData.topHoldings.map((holding, index) => (
                    <div key={index} className={styles.tableRow}>
                      <div className={styles.cell}>
                        <div className={styles.symbol}>{holding.symbol}</div>
                      </div>
                      <div className={styles.cell}>
                        <div className={styles.companyName}>{holding.name}</div>
                      </div>
                      <div className={styles.cell}>
                        <div className={styles.weight}>{holding.weight}%</div>
                      </div>
                      <div className={styles.cell}>
                        <div className={`${styles.return} ${holding.return >= 0 ? styles.positive : styles.negative}`}>
                          {formatPercentage(holding.return)}
                        </div>
                      </div>
                      <div className={styles.cell}>
                        <div className={styles.price}>${holding.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;