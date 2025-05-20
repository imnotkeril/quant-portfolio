import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card/Card';
import { MetricCard } from '../../components/common/MetricCard/MetricCard';
import { LineChart } from '../../components/charts/LineChart/LineChart';
import { PieChart } from '../../components/charts/PieChart/PieChart';
import { PortfolioCard } from '../../components/portfolio/PortfolioCard/PortfolioCard';
import { PortfolioList } from '../../components/portfolio/PortfolioList/PortfolioList';
import { MetricsTable } from '../../components/analytics/MetricsTable/MetricsTable';
import { COLORS } from '../../constants/colors';

// Define types for the dashboard data
interface PortfolioSummary {
  id: string;
  name: string;
  description?: string;
  assetCount: number;
  totalValue: number;
  performance: {
    daily: number;
    weekly: number;
    monthly: number;
    ytd: number;
    annual: number;
    total: number;
  };
  riskMetrics: {
    volatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
    beta?: number;
  };
  lastUpdated: string;
  createdAt: string;
}

interface MarketData {
  indices: {
    name: string;
    value: number;
    change: number;
    changePercent: number;
  }[];
  topGainers: {
    ticker: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
  }[];
  topLosers: {
    ticker: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
  }[];
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  date: string;
  portfolioId?: string;
  portfolioName?: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState<PortfolioSummary[]>([]);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch portfolios
        // TODO: Replace with actual API call
        // const response = await fetch('/api/portfolios');
        // const data = await response.json();
        // setPortfolios(data);

        // Mock data for development
        const mockPortfolios: PortfolioSummary[] = [
          {
            id: '1',
            name: 'Main Investment Portfolio',
            description: 'Long-term investment strategy focused on growth',
            assetCount: 12,
            totalValue: 127850.42,
            performance: {
              daily: 0.0025,
              weekly: 0.0115,
              monthly: 0.0342,
              ytd: 0.0756,
              annual: 0.1245,
              total: 0.2756
            },
            riskMetrics: {
              volatility: 0.1624,
              sharpeRatio: 1.42,
              maxDrawdown: 0.1258,
              beta: 0.85
            },
            lastUpdated: '2025-05-10T15:30:00Z',
            createdAt: '2024-01-15T10:25:00Z'
          },
          {
            id: '2',
            name: 'Retirement Fund',
            description: 'Conservative allocation for retirement savings',
            assetCount: 8,
            totalValue: 284620.18,
            performance: {
              daily: 0.0012,
              weekly: 0.0068,
              monthly: 0.0215,
              ytd: 0.0516,
              annual: 0.0835,
              total: 0.3156
            },
            riskMetrics: {
              volatility: 0.1125,
              sharpeRatio: 1.18,
              maxDrawdown: 0.0845,
              beta: 0.65
            },
            lastUpdated: '2025-05-12T09:45:00Z',
            createdAt: '2023-11-08T16:10:00Z'
          },
          {
            id: '3',
            name: 'Tech Sector Focus',
            description: 'High growth technology sector investments',
            assetCount: 15,
            totalValue: 58240.75,
            performance: {
              daily: -0.0045,
              weekly: 0.0215,
              monthly: 0.0562,
              ytd: 0.1256,
              annual: 0.1845,
              total: 0.2156
            },
            riskMetrics: {
              volatility: 0.2345,
              sharpeRatio: 1.65,
              maxDrawdown: 0.1856,
              beta: 1.25
            },
            lastUpdated: '2025-05-14T11:20:00Z',
            createdAt: '2024-03-22T13:40:00Z'
          }
        ];

        setPortfolios(mockPortfolios);

        // If we have portfolios, select the first one by default
        if (mockPortfolios.length > 0) {
          setSelectedPortfolio(mockPortfolios[0].id);
        }

        // Mock market data
        const mockMarketData: MarketData = {
          indices: [
            { name: 'S&P 500', value: 5462.34, change: 18.45, changePercent: 0.0034 },
            { name: 'NASDAQ', value: 17845.72, change: 65.28, changePercent: 0.0037 },
            { name: 'Dow Jones', value: 40210.55, change: -42.65, changePercent: -0.0011 },
            { name: 'Russell 2000', value: 2185.62, change: 3.82, changePercent: 0.0018 }
          ],
          topGainers: [
            { ticker: 'NVDA', name: 'NVIDIA Corporation', price: 1025.42, change: 28.65, changePercent: 0.0287 },
            { ticker: 'TSLA', name: 'Tesla Inc', price: 242.85, change: 5.65, changePercent: 0.0238 },
            { ticker: 'AMD', name: 'Advanced Micro Devices Inc', price: 165.24, change: 3.47, changePercent: 0.0215 }
          ],
          topLosers: [
            { ticker: 'INTC', name: 'Intel Corporation', price: 35.28, change: -1.85, changePercent: -0.0498 },
            { ticker: 'BA', name: 'Boeing Co', price: 172.65, change: -5.32, changePercent: -0.0299 },
            { ticker: 'DIS', name: 'Walt Disney Co', price: 112.85, change: -2.45, changePercent: -0.0212 }
          ]
        };

        setMarketData(mockMarketData);

        // Mock recent activity
        const mockActivity: RecentActivity[] = [
          {
            id: '1',
            type: 'optimization',
            description: 'Portfolio optimization completed',
            date: '2025-05-14T10:30:00Z',
            portfolioId: '1',
            portfolioName: 'Main Investment Portfolio'
          },
          {
            id: '2',
            type: 'rebalance',
            description: 'Portfolio rebalanced',
            date: '2025-05-12T14:15:00Z',
            portfolioId: '2',
            portfolioName: 'Retirement Fund'
          },
          {
            id: '3',
            type: 'analysis',
            description: 'Risk analysis performed',
            date: '2025-05-10T09:45:00Z',
            portfolioId: '3',
            portfolioName: 'Tech Sector Focus'
          },
          {
            id: '4',
            type: 'create',
            description: 'New portfolio created',
            date: '2025-05-08T16:20:00Z',
            portfolioId: '3',
            portfolioName: 'Tech Sector Focus'
          }
        ];

        setRecentActivity(mockActivity);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handlePortfolioSelect = (portfolioId: string) => {
    setSelectedPortfolio(portfolioId);
  };

  const handleCreatePortfolio = () => {
    navigate('/portfolio/create');
  };

  const handlePortfolioAnalyze = (portfolioId: string) => {
    navigate(`/portfolio/analyze/${portfolioId}`);
  };

  const handlePortfolioOptimize = (portfolioId: string) => {
    navigate(`/portfolio/optimize/${portfolioId}`);
  };

  const handlePortfolioRisk = (portfolioId: string) => {
    navigate(`/portfolio/risk/${portfolioId}`);
  };

  // Get the selected portfolio
  const activePortfolio = portfolios.find(p => p.id === selectedPortfolio);

  // Format date string to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format percent values
  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${(value * 100).toFixed(2)}%`;
  };

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Generate sample performance data for the chart
  const generatePerformanceData = () => {
    if (!activePortfolio) return [];

    // Generate 30 days of mock data
    const data = [];
    const today = new Date();
    const startValue = activePortfolio.totalValue / (1 + activePortfolio.performance.total);

    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Generate a smooth growth curve with some daily variations
      const progress = (30 - i) / 30;
      const totalGrowth = activePortfolio.performance.total * progress;
      const dailyVariation = (Math.random() - 0.5) * 0.005; // Random daily fluctuation

      data.push({
        date: date.toISOString().split('T')[0],
        portfolio: startValue * (1 + totalGrowth + dailyVariation),
        benchmark: startValue * (1 + totalGrowth * 0.8 + dailyVariation * 0.8), // Benchmark slightly underperforms
      });
    }

    return data;
  };

  // Generate asset allocation data for the pie chart
  const generateAllocationData = () => {
    if (!activePortfolio) return [];

    // Mock asset allocation data
    return [
      { name: 'Stocks', value: 0.65 },
      { name: 'Bonds', value: 0.20 },
      { name: 'Cash', value: 0.05 },
      { name: 'Real Estate', value: 0.07 },
      { name: 'Commodities', value: 0.03 }
    ];
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2 h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <button
          onClick={handleCreatePortfolio}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded"
        >
          Create Portfolio
        </button>
      </div>

      {/* Market Overview */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Market Overview</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {marketData?.indices.map((index, i) => (
            <MetricCard
              key={i}
              title={index.name}
              value={index.value.toLocaleString()}
              delta={formatPercent(index.changePercent)}
              deltaDirection={index.change >= 0 ? "normal" : "inverse"}
            />
          ))}
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-1">
          <Card className="h-full p-4">
            <h2 className="text-xl font-semibold mb-4">Your Portfolios</h2>

            {portfolios.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No portfolios found.</p>
                <button
                  onClick={handleCreatePortfolio}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded"
                >
                  Create Your First Portfolio
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {portfolios.map(portfolio => (
                  <PortfolioCard
                    key={portfolio.id}
                    portfolio={{
                      id: portfolio.id,
                      name: portfolio.name,
                      description: portfolio.description,
                      value: portfolio.totalValue,
                      performance: portfolio.performance.daily,
                      assetCount: portfolio.assetCount,
                      lastUpdated: portfolio.lastUpdated
                    }}
                    selected={portfolio.id === selectedPortfolio}
                    onClick={() => handlePortfolioSelect(portfolio.id)}
                    onAnalyze={() => handlePortfolioAnalyze(portfolio.id)}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-3">
          {activePortfolio ? (
            <>
              <Card className="p-4 mb-6">
                <div className="flex flex-wrap items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{activePortfolio.name}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{activePortfolio.description}</p>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePortfolioAnalyze(activePortfolio.id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-1 px-3 rounded text-sm"
                    >
                      Analyze
                    </button>
                    <button
                      onClick={() => handlePortfolioOptimize(activePortfolio.id)}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-3 rounded text-sm"
                    >
                      Optimize
                    </button>
                    <button
                      onClick={() => handlePortfolioRisk(activePortfolio.id)}
                      className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-1 px-3 rounded text-sm"
                    >
                      Risk
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <MetricCard
                    title="Total Value"
                    value={formatCurrency(activePortfolio.totalValue)}
                  />

                  <MetricCard
                    title="Today"
                    value={formatPercent(activePortfolio.performance.daily)}
                    deltaDirection={activePortfolio.performance.daily >= 0 ? "normal" : "inverse"}
                  />

                  <MetricCard
                    title="MTD"
                    value={formatPercent(activePortfolio.performance.monthly)}
                    deltaDirection={activePortfolio.performance.monthly >= 0 ? "normal" : "inverse"}
                  />

                  <MetricCard
                    title="YTD"
                    value={formatPercent(activePortfolio.performance.ytd)}
                    deltaDirection={activePortfolio.performance.ytd >= 0 ? "normal" : "inverse"}
                  />
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Performance</h3>
                  <LineChart
                    data={generatePerformanceData()}
                    series={[
                      { key: 'portfolio', name: 'Portfolio', color: COLORS.ACCENT },
                      { key: 'benchmark', name: 'Benchmark', color: COLORS.NEUTRAL_1 }
                    ]}
                    xAxisDataKey="date"
                    height={300}
                    showLegend={true}
                    showGrid={true}
                  />
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h3 className="text-lg font-medium mb-4">Asset Allocation</h3>
                  <PieChart
                    data={generateAllocationData()}
                    nameKey="name"
                    dataKey="value"
                    colors={[
                      COLORS.ACCENT,
                      COLORS.NEUTRAL_1,
                      COLORS.NEUTRAL_2,
                      COLORS.POSITIVE,
                      COLORS.NEGATIVE
                    ]}
                    height={250}
                  />
                </Card>

                <Card className="p-4">
                  <h3 className="text-lg font-medium mb-4">Risk Metrics</h3>
                  <MetricsTable
                    metrics={[
                      { name: 'Volatility', value: `${(activePortfolio.riskMetrics.volatility * 100).toFixed(2)}%` },
                      { name: 'Sharpe Ratio', value: activePortfolio.riskMetrics.sharpeRatio.toFixed(2) },
                      { name: 'Max Drawdown', value: `${(activePortfolio.riskMetrics.maxDrawdown * 100).toFixed(2)}%` },
                      { name: 'Beta', value: activePortfolio.riskMetrics.beta?.toFixed(2) || 'N/A' }
                    ]}
                  />
                </Card>
              </div>
            </>
          ) : (
            <Card className="p-4 flex flex-col items-center justify-center h-96">
              <p className="text-gray-500 dark:text-gray-400 mb-4">Select a portfolio to view details.</p>
              <button
                onClick={handleCreatePortfolio}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded"
              >
                Create New Portfolio
              </button>
            </Card>
          )}
        </div>
      </div>

      {/* Market Movers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Top Gainers</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                {marketData?.topGainers.map((stock, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {stock.ticker}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {stock.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      ${stock.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 dark:text-green-400">
                      +${stock.change.toFixed(2)} ({formatPercent(stock.changePercent)})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Top Losers</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                {marketData?.topLosers.map((stock, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {stock.ticker}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {stock.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      ${stock.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 dark:text-red-400">
                      ${stock.change.toFixed(2)} ({formatPercent(stock.changePercent)})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Portfolio
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                {recentActivity.map((activity, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(activity.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`
                        px-2 py-1 text-xs font-medium rounded-full
                        ${activity.type === 'optimization' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : ''}
                        ${activity.type === 'rebalance' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : ''}
                        ${activity.type === 'analysis' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' : ''}
                        ${activity.type === 'create' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : ''}
                      `}>
                        {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {activity.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {activity.portfolioName && (
                        <button
                          onClick={() => activity.portfolioId && handlePortfolioSelect(activity.portfolioId)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          {activity.portfolioName}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MonteCarloChart;