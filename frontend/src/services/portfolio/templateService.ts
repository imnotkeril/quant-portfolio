/**
 * Template service
 * Handles portfolio template management
 */
import { AssetCreate } from '../../types/portfolio';

/**
 * Portfolio Template interface
 */
export interface PortfolioTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  riskLevel: 'Conservative' | 'Moderate' | 'Aggressive';
  expectedReturn: string;
  volatility: string;
  tags: string[];
  assets: TemplateAsset[];
  created: string;
  popularity: number;
  minInvestment?: number;
  rebalancingFrequency?: string;
  targetAudience?: string;
  features?: string[];
}

/**
 * Template Asset interface
 */
export interface TemplateAsset {
  ticker: string;
  name: string;
  weight: number;
  sector: string;
  assetClass: string;
  description?: string;
  rationale?: string;
}

/**
 * Template Category interface
 */
export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  templates: PortfolioTemplate[];
}

/**
 * Template Service class
 */
class TemplateService {
  // Predefined portfolio templates
  private templates: PortfolioTemplate[] = [
    {
      id: 'warren_buffett',
      name: 'Warren Buffett Style',
      description: 'Value investing approach with focus on large-cap dividend-paying stocks',
      category: 'Value Investing',
      riskLevel: 'Moderate',
      expectedReturn: '10-15% annually',
      volatility: '12-16%',
      tags: ['value', 'dividend', 'long-term', 'defensive'],
      created: '2024-01-01',
      popularity: 95,
      minInvestment: 10000,
      rebalancingFrequency: 'Quarterly',
      targetAudience: 'Conservative long-term investors',
      features: [
        'Focus on undervalued companies',
        'Strong dividend yields',
        'Established market leaders',
        'Low turnover strategy'
      ],
      assets: [
        {
          ticker: 'BRK.B',
          name: 'Berkshire Hathaway',
          weight: 25,
          sector: 'Financial Services',
          assetClass: 'stocks',
          description: 'Buffett\'s own conglomerate',
          rationale: 'Direct exposure to Buffett\'s investment philosophy'
        },
        {
          ticker: 'AAPL',
          name: 'Apple Inc.',
          weight: 20,
          sector: 'Technology',
          assetClass: 'stocks',
          description: 'Technology giant with strong brand moat',
          rationale: 'Buffett\'s largest holding with strong fundamentals'
        },
        {
          ticker: 'KO',
          name: 'Coca-Cola',
          weight: 15,
          sector: 'Consumer Defensive',
          assetClass: 'stocks',
          description: 'Global beverage leader',
          rationale: 'Classic Buffett holding with predictable cash flows'
        },
        {
          ticker: 'PG',
          name: 'Procter & Gamble',
          weight: 10,
          sector: 'Consumer Defensive',
          assetClass: 'stocks',
          description: 'Consumer goods giant',
          rationale: 'Dividend aristocrat with strong brands'
        },
        {
          ticker: 'JNJ',
          name: 'Johnson & Johnson',
          weight: 10,
          sector: 'Healthcare',
          assetClass: 'stocks',
          description: 'Healthcare conglomerate',
          rationale: 'Defensive characteristics with dividend growth'
        },
        {
          ticker: 'BAC',
          name: 'Bank of America',
          weight: 10,
          sector: 'Financial Services',
          assetClass: 'stocks',
          description: 'Major US bank',
          rationale: 'Buffett\'s preferred bank exposure'
        },
        {
          ticker: 'KHC',
          name: 'Kraft Heinz',
          weight: 5,
          sector: 'Consumer Defensive',
          assetClass: 'stocks',
          description: 'Food and beverage company',
          rationale: 'Value play in consumer staples'
        },
        {
          ticker: 'AMZN',
          name: 'Amazon',
          weight: 5,
          sector: 'Consumer Cyclical',
          assetClass: 'stocks',
          description: 'E-commerce and cloud leader',
          rationale: 'Growth component to the portfolio'
        }
      ]
    },

    {
      id: 'tech_giants',
      name: 'Tech Giants',
      description: 'Growth-focused portfolio with leading technology companies',
      category: 'Growth',
      riskLevel: 'Aggressive',
      expectedReturn: '15-25% annually',
      volatility: '18-25%',
      tags: ['growth', 'technology', 'high-risk', 'innovation'],
      created: '2024-01-01',
      popularity: 88,
      minInvestment: 5000,
      rebalancingFrequency: 'Semi-annually',
      targetAudience: 'Growth-oriented investors',
      features: [
        'Focus on technology leaders',
        'High growth potential',
        'Innovation-driven companies',
        'Higher volatility'
      ],
      assets: [
        {
          ticker: 'AAPL',
          name: 'Apple Inc.',
          weight: 25,
          sector: 'Technology',
          assetClass: 'stocks',
          description: 'Consumer electronics and services',
          rationale: 'Largest tech company by market cap'
        },
        {
          ticker: 'MSFT',
          name: 'Microsoft Corporation',
          weight: 25,
          sector: 'Technology',
          assetClass: 'stocks',
          description: 'Software and cloud services',
          rationale: 'Enterprise software leader with cloud growth'
        },
        {
          ticker: 'GOOGL',
          name: 'Alphabet Inc.',
          weight: 20,
          sector: 'Technology',
          assetClass: 'stocks',
          description: 'Search and advertising giant',
          rationale: 'Dominant position in digital advertising'
        },
        {
          ticker: 'AMZN',
          name: 'Amazon.com Inc.',
          weight: 15,
          sector: 'Consumer Cyclical',
          assetClass: 'stocks',
          description: 'E-commerce and cloud computing',
          rationale: 'Leader in e-commerce and AWS cloud services'
        },
        {
          ticker: 'META',
          name: 'Meta Platforms',
          weight: 10,
          sector: 'Technology',
          assetClass: 'stocks',
          description: 'Social media and metaverse',
          rationale: 'Social media dominance and metaverse potential'
        },
        {
          ticker: 'NVDA',
          name: 'NVIDIA Corporation',
          weight: 5,
          sector: 'Technology',
          assetClass: 'stocks',
          description: 'Graphics and AI chips',
          rationale: 'AI and gaming hardware leader'
        }
      ]
    },

    {
      id: 'sp500_etf',
      name: 'S&P 500 Index',
      description: 'Simple and effective broad market exposure through ETFs',
      category: 'Market Cap Weighted',
      riskLevel: 'Moderate',
      expectedReturn: '8-12% annually',
      volatility: '15-20%',
      tags: ['index', 'diversified', 'low-cost', 'passive'],
      created: '2024-01-01',
      popularity: 92,
      minInvestment: 1000,
      rebalancingFrequency: 'Annually',
      targetAudience: 'Beginner and long-term investors',
      features: [
        'Broad market exposure',
        'Low fees',
        'Passive management',
        'Tax efficient'
      ],
      assets: [
        {
          ticker: 'SPY',
          name: 'SPDR S&P 500 ETF',
          weight: 60,
          sector: 'Diversified',
          assetClass: 'etf',
          description: 'Tracks S&P 500 index',
          rationale: 'Core US large-cap exposure'
        },
        {
          ticker: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          weight: 25,
          sector: 'Diversified',
          assetClass: 'etf',
          description: 'Total US stock market',
          rationale: 'Broader market exposure including small caps'
        },
        {
          ticker: 'VXUS',
          name: 'Vanguard Total International Stock ETF',
          weight: 15,
          sector: 'Diversified',
          assetClass: 'etf',
          description: 'International stocks',
          rationale: 'Global diversification outside US'
        }
      ]
    },

    {
      id: 'dividend_growth',
      name: 'Dividend Growth',
      description: 'Companies with consistent dividend increases and strong fundamentals',
      category: 'Dividend Growth',
      riskLevel: 'Conservative',
      expectedReturn: '7-12% annually',
      volatility: '10-15%',
      tags: ['dividend', 'income', 'growth', 'defensive'],
      created: '2024-01-01',
      popularity: 85,
      minInvestment: 10000,
      rebalancingFrequency: 'Quarterly',
      targetAudience: 'Income-focused investors',
      features: [
        'Consistent dividend growth',
        'Quality companies',
        'Income generation',
        'Lower volatility'
      ],
      assets: [
        {
          ticker: 'JNJ',
          name: 'Johnson & Johnson',
          weight: 15,
          sector: 'Healthcare',
          assetClass: 'stocks',
          description: 'Healthcare products and pharmaceuticals',
          rationale: 'Dividend King with 59 years of increases'
        },
        {
          ticker: 'PG',
          name: 'Procter & Gamble',
          weight: 15,
          sector: 'Consumer Defensive',
          assetClass: 'stocks',
          description: 'Consumer goods',
          rationale: 'Dividend King with 67 years of increases'
        },
        {
          ticker: 'KO',
          name: 'Coca-Cola',
          weight: 12,
          sector: 'Consumer Defensive',
          assetClass: 'stocks',
          description: 'Beverage company',
          rationale: 'Dividend King with 61 years of increases'
        },
        {
          ticker: 'PEP',
          name: 'PepsiCo',
          weight: 12,
          sector: 'Consumer Defensive',
          assetClass: 'stocks',
          description: 'Food and beverage',
          rationale: 'Dividend Aristocrat with strong brands'
        },
        {
          ticker: 'WMT',
          name: 'Walmart',
          weight: 10,
          sector: 'Consumer Defensive',
          assetClass: 'stocks',
          description: 'Retail giant',
          rationale: 'Defensive retail with dividend growth'
        },
        {
          ticker: 'MCD',
          name: 'McDonald\'s',
          weight: 8,
          sector: 'Consumer Cyclical',
          assetClass: 'stocks',
          description: 'Fast food restaurants',
          rationale: 'Dividend Aristocrat with global presence'
        },
        {
          ticker: 'HD',
          name: 'Home Depot',
          weight: 8,
          sector: 'Consumer Cyclical',
          assetClass: 'stocks',
          description: 'Home improvement retail',
          rationale: 'Strong dividend growth and market position'
        },
        {
          ticker: 'MMM',
          name: '3M Company',
          weight: 7,
          sector: 'Industrials',
          assetClass: 'stocks',
          description: 'Diversified industrial',
          rationale: 'Dividend King with innovation focus'
        },
        {
          ticker: 'CVX',
          name: 'Chevron',
          weight: 7,
          sector: 'Energy',
          assetClass: 'stocks',
          description: 'Integrated oil company',
          rationale: 'Energy exposure with dividend reliability'
        },
        {
          ticker: 'CAT',
          name: 'Caterpillar',
          weight: 6,
          sector: 'Industrials',
          assetClass: 'stocks',
          description: 'Heavy machinery',
          rationale: 'Cyclical play with dividend growth'
        }
      ]
    },

    {
      id: 'balanced_portfolio',
      name: 'Balanced Portfolio',
      description: 'Mix of stocks, bonds, and other assets for moderate risk',
      category: 'Risk Balanced',
      riskLevel: 'Moderate',
      expectedReturn: '6-10% annually',
      volatility: '8-12%',
      tags: ['balanced', 'diversified', 'moderate', 'allocation'],
      created: '2024-01-01',
      popularity: 90,
      minInvestment: 5000,
      rebalancingFrequency: 'Quarterly',
      targetAudience: 'Moderate risk investors',
      features: [
        'Asset diversification',
        'Risk management',
        'Steady returns',
        'Rebalancing strategy'
      ],
      assets: [
        {
          ticker: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          weight: 40,
          sector: 'Diversified',
          assetClass: 'etf',
          description: 'US total stock market',
          rationale: 'Core equity exposure'
        },
        {
          ticker: 'VXUS',
          name: 'Vanguard Total International Stock ETF',
          weight: 20,
          sector: 'Diversified',
          assetClass: 'etf',
          description: 'International stocks',
          rationale: 'International diversification'
        },
        {
          ticker: 'BND',
          name: 'Vanguard Total Bond Market ETF',
          weight: 25,
          sector: 'Fixed Income',
          assetClass: 'bonds',
          description: 'US bond market',
          rationale: 'Fixed income stability'
        },
        {
          ticker: 'VTEB',
          name: 'Vanguard Tax-Exempt Bond ETF',
          weight: 10,
          sector: 'Fixed Income',
          assetClass: 'bonds',
          description: 'Municipal bonds',
          rationale: 'Tax-efficient income'
        },
        {
          ticker: 'VNQ',
          name: 'Vanguard Real Estate ETF',
          weight: 5,
          sector: 'Real Estate',
          assetClass: 'etf',
          description: 'Real estate investment trusts',
          rationale: 'Real estate diversification'
        }
      ]
    }
  ];

  /**
   * Get all templates
   */
  getTemplates(): PortfolioTemplate[] {
    return this.templates;
  }

  /**
   * Get template by ID
   */
  getTemplateById(id: string): PortfolioTemplate | null {
    return this.templates.find(template => template.id === id) || null;
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: string): PortfolioTemplate[] {
    return this.templates.filter(template => template.category === category);
  }

  /**
   * Get template categories
   */
  getTemplateCategories(): TemplateCategory[] {
    const categories = new Map<string, TemplateCategory>();

    this.templates.forEach(template => {
      if (!categories.has(template.category)) {
        categories.set(template.category, {
          id: template.category.toLowerCase().replace(/\s+/g, '_'),
          name: template.category,
          description: this.getCategoryDescription(template.category),
          icon: this.getCategoryIcon(template.category),
          templates: []
        });
      }
      categories.get(template.category)!.templates.push(template);
    });

    return Array.from(categories.values());
  }

  /**
   * Get popular templates
   */
  getPopularTemplates(limit: number = 5): PortfolioTemplate[] {
    return this.templates
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);
  }

  /**
   * Get templates by risk level
   */
  getTemplatesByRiskLevel(riskLevel: string): PortfolioTemplate[] {
    return this.templates.filter(template => template.riskLevel === riskLevel);
  }

  /**
   * Search templates
   */
  searchTemplates(query: string): PortfolioTemplate[] {
    const searchTerm = query.toLowerCase().trim();

    if (!searchTerm) {
      return this.templates;
    }

    return this.templates.filter(template =>
      template.name.toLowerCase().includes(searchTerm) ||
      template.description.toLowerCase().includes(searchTerm) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      template.category.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * FIXED: Convert template to asset creation format
   * Weights are already in percentage format (0-100), no need to divide by 100
   */
  templateToAssets(template: PortfolioTemplate): AssetCreate[] {
    return template.assets.map(asset => ({
      ticker: asset.ticker,
      name: asset.name,
      weight: asset.weight, // Keep as percentage (DO NOT divide by 100)
      sector: asset.sector,
      assetClass: asset.assetClass,
      quantity: 0,
      purchasePrice: 0,
      currentPrice: 0,
      purchaseDate: new Date().toISOString().split('T')[0],
      currency: 'USD',
      country: 'United States',
      exchange: 'NASDAQ',
    }));
  }

  /**
   * Get template statistics
   */
  getTemplateStats(template: PortfolioTemplate) {
    const sectors = new Map<string, number>();
    const assetClasses = new Map<string, number>();

    template.assets.forEach(asset => {
      sectors.set(asset.sector, (sectors.get(asset.sector) || 0) + asset.weight);
      assetClasses.set(asset.assetClass, (assetClasses.get(asset.assetClass) || 0) + asset.weight);
    });

    return {
      totalAssets: template.assets.length,
      sectors: Object.fromEntries(sectors),
      assetClasses: Object.fromEntries(assetClasses),
      averageWeight: template.assets.reduce((sum, asset) => sum + asset.weight, 0) / template.assets.length,
      maxWeight: Math.max(...template.assets.map(asset => asset.weight)),
      minWeight: Math.min(...template.assets.map(asset => asset.weight))
    };
  }

  /**
   * Get category description
   */
  private getCategoryDescription(category: string): string {
    const descriptions = {
      'Value Investing': 'Focus on undervalued companies with strong fundamentals',
      'Growth': 'Companies with high growth potential and innovation',
      'Market Cap Weighted': 'Allocation based on company size and market value',
      'Dividend Growth': 'Companies with consistent dividend increases',
      'Sector Specific': 'Concentrated exposure to specific market sectors',
      'Geographic': 'Regional or country-specific investment strategies',
      'Risk Balanced': 'Optimized risk-return profiles across asset classes'
    };

    return descriptions[category] || 'Custom investment strategy';
  }

  /**
   * Get category icon
   */
  private getCategoryIcon(category: string): string {
    const icons = {
      'Value Investing': '💎',
      'Growth': '🚀',
      'Market Cap Weighted': '📊',
      'Dividend Growth': '💰',
      'Sector Specific': '🏭',
      'Geographic': '🌍',
      'Risk Balanced': '⚖️'
    };

    return icons[category] || '📈';
  }
}

// Export singleton instance
export const templateService = new TemplateService();
export default templateService;