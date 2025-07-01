/**
 * Portfolio Templates
 * Ready-made portfolio configurations for different investment strategies
 */

export interface PortfolioTemplateAsset {
  ticker: string;
  name: string;
  weight: number;
  sector: string;
  assetClass: string;
}

export interface PortfolioTemplate {
  id: string;
  name: string;
  description: string;
  strategy: string;
  riskLevel: 'low' | 'medium' | 'high';
  expectedReturn: string;
  timeHorizon: string;
  assets: PortfolioTemplateAsset[];
  tags: string[];
  icon: string;
}

export const PORTFOLIO_TEMPLATES: PortfolioTemplate[] = [
  {
    id: 'warren_buffett',
    name: 'Warren Buffett Style',
    description: 'Value investing approach with focus on quality companies and long-term growth',
    strategy: 'Value investing with dividend focus',
    riskLevel: 'medium',
    expectedReturn: '8-12% annually',
    timeHorizon: '10+ years',
    icon: '🎯',
    tags: ['value', 'dividend', 'conservative', 'long-term'],
    assets: [
      { ticker: 'BRK.B', name: 'Berkshire Hathaway', weight: 25, sector: 'Financial Services', assetClass: 'stocks' },
      { ticker: 'AAPL', name: 'Apple Inc.', weight: 20, sector: 'Technology', assetClass: 'stocks' },
      { ticker: 'KO', name: 'Coca-Cola', weight: 15, sector: 'Consumer Defensive', assetClass: 'stocks' },
      { ticker: 'PG', name: 'Procter & Gamble', weight: 10, sector: 'Consumer Defensive', assetClass: 'stocks' },
      { ticker: 'JNJ', name: 'Johnson & Johnson', weight: 10, sector: 'Healthcare', assetClass: 'stocks' },
      { ticker: 'BAC', name: 'Bank of America', weight: 10, sector: 'Financial Services', assetClass: 'stocks' },
      { ticker: 'KHC', name: 'Kraft Heinz', weight: 5, sector: 'Consumer Defensive', assetClass: 'stocks' },
      { ticker: 'AMZN', name: 'Amazon', weight: 5, sector: 'Consumer Cyclical', assetClass: 'stocks' }
    ]
  },

  {
    id: 'tech_giants',
    name: 'Tech Giants',
    description: 'Growth-focused portfolio with leading technology companies',
    strategy: 'Growth investing in dominant tech companies',
    riskLevel: 'high',
    expectedReturn: '12-18% annually',
    timeHorizon: '5-10 years',
    icon: '🚀',
    tags: ['tech', 'growth', 'aggressive', 'innovation'],
    assets: [
      { ticker: 'AAPL', name: 'Apple Inc.', weight: 25, sector: 'Technology', assetClass: 'stocks' },
      { ticker: 'MSFT', name: 'Microsoft', weight: 20, sector: 'Technology', assetClass: 'stocks' },
      { ticker: 'GOOGL', name: 'Alphabet (Google)', weight: 15, sector: 'Communication Services', assetClass: 'stocks' },
      { ticker: 'AMZN', name: 'Amazon', weight: 15, sector: 'Consumer Cyclical', assetClass: 'stocks' },
      { ticker: 'TSLA', name: 'Tesla', weight: 10, sector: 'Consumer Cyclical', assetClass: 'stocks' },
      { ticker: 'META', name: 'Meta (Facebook)', weight: 10, sector: 'Communication Services', assetClass: 'stocks' },
      { ticker: 'NVDA', name: 'NVIDIA', weight: 5, sector: 'Technology', assetClass: 'stocks' }
    ]
  },

  {
    id: 'sp500_top10',
    name: 'S&P 500 Top 10',
    description: 'The 10 largest companies in the S&P 500 by market capitalization',
    strategy: 'Large-cap focus with market leaders',
    riskLevel: 'medium',
    expectedReturn: '10-14% annually',
    timeHorizon: '5+ years',
    icon: '📊',
    tags: ['large-cap', 'diversified', 'blue-chip', 'stable'],
    assets: [
      { ticker: 'AAPL', name: 'Apple Inc.', weight: 12, sector: 'Technology', assetClass: 'stocks' },
      { ticker: 'MSFT', name: 'Microsoft', weight: 10, sector: 'Technology', assetClass: 'stocks' },
      { ticker: 'GOOGL', name: 'Alphabet', weight: 8, sector: 'Communication Services', assetClass: 'stocks' },
      { ticker: 'AMZN', name: 'Amazon', weight: 6, sector: 'Consumer Cyclical', assetClass: 'stocks' },
      { ticker: 'TSLA', name: 'Tesla', weight: 4, sector: 'Consumer Cyclical', assetClass: 'stocks' },
      { ticker: 'BRK.B', name: 'Berkshire Hathaway', weight: 3, sector: 'Financial Services', assetClass: 'stocks' },
      { ticker: 'META', name: 'Meta', weight: 3, sector: 'Communication Services', assetClass: 'stocks' },
      { ticker: 'UNH', name: 'UnitedHealth', weight: 3, sector: 'Healthcare', assetClass: 'stocks' },
      { ticker: 'JNJ', name: 'Johnson & Johnson', weight: 3, sector: 'Healthcare', assetClass: 'stocks' },
      { ticker: 'NVDA', name: 'NVIDIA', weight: 3, sector: 'Technology', assetClass: 'stocks' },
      { ticker: 'SPY', name: 'SPDR S&P 500 ETF', weight: 45, sector: 'Diversified', assetClass: 'etf' }
    ]
  },

  {
    id: 'dividend_aristocrats',
    name: 'Dividend Aristocrats',
    description: 'Companies with 25+ years of consecutive dividend increases',
    strategy: 'Income generation with dividend growth',
    riskLevel: 'low',
    expectedReturn: '6-10% annually',
    timeHorizon: '10+ years',
    icon: '💰',
    tags: ['dividend', 'income', 'conservative', 'stable'],
    assets: [
      { ticker: 'JNJ', name: 'Johnson & Johnson', weight: 15, sector: 'Healthcare', assetClass: 'stocks' },
      { ticker: 'PG', name: 'Procter & Gamble', weight: 15, sector: 'Consumer Defensive', assetClass: 'stocks' },
      { ticker: 'KO', name: 'Coca-Cola', weight: 12, sector: 'Consumer Defensive', assetClass: 'stocks' },
      { ticker: 'PEP', name: 'PepsiCo', weight: 12, sector: 'Consumer Defensive', assetClass: 'stocks' },
      { ticker: 'WMT', name: 'Walmart', weight: 10, sector: 'Consumer Defensive', assetClass: 'stocks' },
      { ticker: 'MCD', name: 'McDonald\'s', weight: 8, sector: 'Consumer Cyclical', assetClass: 'stocks' },
      { ticker: 'HD', name: 'Home Depot', weight: 8, sector: 'Consumer Cyclical', assetClass: 'stocks' },
      { ticker: 'MMM', name: '3M Company', weight: 7, sector: 'Industrials', assetClass: 'stocks' },
      { ticker: 'CVX', name: 'Chevron', weight: 7, sector: 'Energy', assetClass: 'stocks' },
      { ticker: 'CAT', name: 'Caterpillar', weight: 6, sector: 'Industrials', assetClass: 'stocks' }
    ]
  },

  {
    id: 'balanced_global',
    name: 'Balanced Global Portfolio',
    description: 'Diversified mix of stocks, bonds, and international exposure',
    strategy: 'Asset allocation with global diversification',
    riskLevel: 'medium',
    expectedReturn: '7-11% annually',
    timeHorizon: '7+ years',
    icon: '🌍',
    tags: ['balanced', 'diversified', 'global', 'moderate'],
    assets: [
      { ticker: 'VTI', name: 'Total Stock Market ETF', weight: 30, sector: 'Diversified', assetClass: 'etf' },
      { ticker: 'VXUS', name: 'Total International Stock ETF', weight: 20, sector: 'Diversified', assetClass: 'etf' },
      { ticker: 'BND', name: 'Total Bond Market ETF', weight: 25, sector: 'Fixed Income', assetClass: 'bonds' },
      { ticker: 'VTIAX', name: 'Total International Bond ETF', weight: 10, sector: 'Fixed Income', assetClass: 'bonds' },
      { ticker: 'VNQ', name: 'Real Estate ETF', weight: 5, sector: 'Real Estate', assetClass: 'etf' },
      { ticker: 'VTEB', name: 'Tax-Exempt Bond ETF', weight: 5, sector: 'Fixed Income', assetClass: 'bonds' },
      { ticker: 'VMOT', name: 'Multisector Bond ETF', weight: 5, sector: 'Fixed Income', assetClass: 'bonds' }
    ]
  }
];

/**
 * Get portfolio template by ID
 */
export const getPortfolioTemplate = (id: string): PortfolioTemplate | undefined => {
  return PORTFOLIO_TEMPLATES.find(template => template.id === id);
};

/**
 * Get templates by risk level
 */
export const getTemplatesByRiskLevel = (riskLevel: 'low' | 'medium' | 'high'): PortfolioTemplate[] => {
  return PORTFOLIO_TEMPLATES.filter(template => template.riskLevel === riskLevel);
};

/**
 * Get templates by tag
 */
export const getTemplatesByTag = (tag: string): PortfolioTemplate[] => {
  return PORTFOLIO_TEMPLATES.filter(template =>
    template.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
  );
};

/**
 * Convert template to form data
 */
export const templateToFormData = (template: PortfolioTemplate, initialCash: number = 100000) => {
  return {
    name: template.name,
    description: template.description,
    type: 'CUSTOM' as const,
    currency: 'USD' as const,
    initialCash,
    assets: template.assets.map((asset, index) => ({
      id: `template_${index}`,
      ticker: asset.ticker,
      name: asset.name,
      weight: asset.weight,
      quantity: Math.floor((initialCash * asset.weight / 100) / 100), // Assuming $100 per share average
      purchasePrice: 100, // Default price
      currentPrice: 100, // Default price
      purchaseDate: new Date().toISOString().split('T')[0],
      sector: asset.sector,
      industry: '',
      assetClass: asset.assetClass,
      currency: 'USD',
      country: 'United States',
      exchange: 'NASDAQ'
    })),
    riskTolerance: template.riskLevel === 'low' ? 'CONSERVATIVE' :
                   template.riskLevel === 'high' ? 'AGGRESSIVE' : 'MODERATE',
    investmentObjective: 'GROWTH',
    tags: template.tags
  };
};