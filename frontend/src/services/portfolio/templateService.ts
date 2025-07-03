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
          description: 'Technology giant with strong moat',
          rationale: 'Dominant market position and consistent cash flow'
        },
        {
          ticker: 'KO',
          name: 'Coca-Cola',
          weight: 15,
          sector: 'Consumer Defensive',
          assetClass: 'stocks',
          description: 'Global beverage leader',
          rationale: 'Strong brand moat and dividend history'
        },
        {
          ticker: 'PG',
          name: 'Procter & Gamble',
          weight: 10,
          sector: 'Consumer Defensive',
          assetClass: 'stocks',
          description: 'Consumer staples giant',
          rationale: 'Defensive characteristics and dividend aristocrat'
        },
        {
          ticker: 'JNJ',
          name: 'Johnson & Johnson',
          weight: 10,
          sector: 'Healthcare',
          assetClass: 'stocks',
          description: 'Diversified healthcare company',
          rationale: 'Stable cash flows and dividend growth'
        },
        {
          ticker: 'BAC',
          name: 'Bank of America',
          weight: 10,
          sector: 'Financial Services',
          assetClass: 'stocks',
          description: 'Major US bank',
          rationale: 'Strong capital position and improving efficiency'
        },
        {
          ticker: 'KHC',
          name: 'Kraft Heinz',
          weight: 5,
          sector: 'Consumer Defensive',
          assetClass: 'stocks',
          description: 'Food and beverage company',
          rationale: 'Turnaround story with strong brands'
        },
        {
          ticker: 'AMZN',
          name: 'Amazon.com',
          weight: 5,
          sector: 'Consumer Cyclical',
          assetClass: 'stocks',
          description: 'E-commerce and cloud leader',
          rationale: 'Dominant market position and growth potential'
        }
      ]
    },
    {
      id: 'tech_giants',
      name: 'Tech Giants',
      description: 'Growth-focused portfolio concentrated in major technology companies',
      category: 'Growth',
      riskLevel: 'Aggressive',
      expectedReturn: '15-25% annually',
      volatility: '20-30%',
      tags: ['technology', 'growth', 'innovation', 'high-risk'],
      created: '2024-01-01',
      popularity: 88,
      minInvestment: 5000,
      rebalancingFrequency: 'Monthly',
      targetAudience: 'Growth-oriented investors with high risk tolerance',
      features: [
        'Focus on technological innovation',
        'High growth potential',
        'Market-leading companies',
        'Digital transformation plays'
      ],
      assets: [
        {
          ticker: 'AAPL',
          name: 'Apple Inc.',
          weight: 25,
          sector: 'Technology',
          assetClass: 'stocks',
          description: 'Consumer electronics and services',
          rationale: 'Ecosystem lock-in and strong cash generation'
        },
        {
          ticker: 'MSFT',
          name: 'Microsoft Corporation',
          weight: 20,
          sector: 'Technology',
          assetClass: 'stocks',
          description: 'Cloud computing and productivity software',
          rationale: 'Leading cloud platform and recurring revenue model'
        },
        {
          ticker: 'GOOGL',
          name: 'Alphabet Inc.',
          weight: 15,
          sector: 'Technology',
          assetClass: 'stocks',
          description: 'Search engine and digital advertising',
          rationale: 'Dominant search market position and AI leadership'
        },
        {
          ticker: 'AMZN',
          name: 'Amazon.com Inc.',
          weight: 15,
          sector: 'Consumer Cyclical',
          assetClass: 'stocks',
          description: 'E-commerce and cloud services',
          rationale: 'Market leadership in e-commerce and cloud computing'
        },
        {
          ticker: 'TSLA',
          name: 'Tesla Inc.',
          weight: 10,
          sector: 'Consumer Cyclical',
          assetClass: 'stocks',
          description: 'Electric vehicles and clean energy',
          rationale: 'Electric vehicle market leader and innovation'
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
          description: 'Graphics processing and AI chips',
          rationale: 'AI and machine learning hardware leader'
        }
      ]
    },
    {
      id: 'sp500_top10',
      name: 'S&P 500 Top 10',
      description: 'Largest companies in the S&P 500 by market capitalization',
      category: 'Market Cap Weighted',
      riskLevel: 'Moderate',
      expectedReturn: '8-12% annually',
      volatility: '15-20%',
      tags: ['large-cap', 'diversified', 'market-cap-weighted', 'blue-chip'],
      created: '2024-01-01',
      popularity: 92,
      minInvestment: 1000,
      rebalancingFrequency: 'Quarterly',
      targetAudience: 'Investors seeking broad market exposure',
      features: [
        'Market cap weighted allocation',
        'Largest US companies',
        'Sector diversification',
        'Liquid and stable'
      ],
      assets: [
        {
          ticker: 'AAPL',
          name: 'Apple Inc.',
          weight: 12,
          sector: 'Technology',
          assetClass: 'stocks',
          description: 'Largest US company by market cap',
          rationale: 'Market leadership and strong fundamentals'
        },
        {
          ticker: 'MSFT',
          name: 'Microsoft Corporation',
          weight: 10,
          sector: 'Technology',
          assetClass: 'stocks',
          description: 'Cloud computing leader',
          rationale: 'Strong competitive position in cloud services'
        },
        {
          ticker: 'GOOGL',
          name: 'Alphabet Inc.',
          weight: 8,
          sector: 'Technology',
          assetClass: 'stocks',
          description: 'Search and advertising giant',
          rationale: 'Dominant search market position'
        },
        {
          ticker: 'AMZN',
          name: 'Amazon.com Inc.',
          weight: 6,
          sector: 'Consumer Cyclical',
          assetClass: 'stocks',
          description: 'E-commerce and cloud leader',
          rationale: 'Market leadership in multiple segments'
        },
        {
          ticker: 'TSLA',
          name: 'Tesla Inc.',
          weight: 4,
          sector: 'Consumer Cyclical',
          assetClass: 'stocks',
          description: 'Electric vehicle pioneer',
          rationale: 'Innovation leader in electric vehicles'
        },
        {
          ticker: 'BRK.B',
          name: 'Berkshire Hathaway',
          weight: 3,
          sector: 'Financial Services',
          assetClass: 'stocks',
          description: 'Diversified conglomerate',
          rationale: 'Proven investment management track record'
        },
        {
          ticker: 'META',
          name: 'Meta Platforms',
          weight: 3,
          sector: 'Technology',
          assetClass: 'stocks',
          description: 'Social media leader',
          rationale: 'Dominant social media platforms'
        },
        {
          ticker: 'UNH',
          name: 'UnitedHealth Group',
          weight: 3,
          sector: 'Healthcare',
          assetClass: 'stocks',
          description: 'Healthcare services leader',
          rationale: 'Growing healthcare market exposure'
        },
        {
          ticker: 'JNJ',
          name: 'Johnson & Johnson',
          weight: 3,
          sector: 'Healthcare',
          assetClass: 'stocks',
          description: 'Diversified healthcare',
          rationale: 'Stable healthcare cash flows'
        },
        {
          ticker: 'NVDA',
          name: 'NVIDIA Corporation',
          weight: 3,
          sector: 'Technology',
          assetClass: 'stocks',
          description: 'AI and graphics chips',
          rationale: 'AI revolution beneficiary'
        }
      ]
    },
    {
      id: 'dividend_aristocrats',
      name: 'Dividend Aristocrats',
      description: 'Companies with 25+ years of consecutive dividend increases',
      category: 'Dividend Growth',
      riskLevel: 'Conservative',
      expectedReturn: '6-10% annually',
      volatility: '8-12%',
      tags: ['dividend', 'income', 'conservative', 'aristocrats'],
      created: '2024-01-01',
      popularity: 78,
      minInvestment: 15000,
      rebalancingFrequency: 'Semi-annually',
      targetAudience: 'Income-focused investors seeking stability',
      features: [
        'Consistent dividend growth',
        'Established companies',
        'Lower volatility',
        'Inflation protection'
      ],
      assets: [
        {
          ticker: 'JNJ',
          name: 'Johnson & Johnson',
          weight: 15,
          sector: 'Healthcare',
          assetClass: 'stocks',
          description: 'Healthcare conglomerate',
          rationale: '59 years of consecutive dividend increases'
        },
        {
          ticker: 'PG',
          name: 'Procter & Gamble',
          weight: 15,
          sector: 'Consumer Defensive',
          assetClass: 'stocks',
          description: 'Consumer products giant',
          rationale: '66 years of consecutive dividend increases'
        },
        {
          ticker: 'KO',
          name: 'Coca-Cola',
          weight: 12,
          sector: 'Consumer Defensive',
          assetClass: 'stocks',
          description: 'Beverage leader',
          rationale: '59 years of consecutive dividend increases'
        },
        {
          ticker: 'PEP',
          name: 'PepsiCo',
          weight: 12,
          sector: 'Consumer Defensive',
          assetClass: 'stocks',
          description: 'Food and beverage company',
          rationale: '49 years of consecutive dividend increases'
        },
        {
          ticker: 'WMT',
          name: 'Walmart',
          weight: 10,
          sector: 'Consumer Defensive',
          assetClass: 'stocks',
          description: 'Retail giant',
          rationale: '48 years of consecutive dividend increases'
        },
        {
          ticker: 'MCD',
          name: 'McDonald\'s',
          weight: 8,
          sector: 'Consumer Cyclical',
          assetClass: 'stocks',
          description: 'Fast food chain',
          rationale: '45 years of consecutive dividend increases'
        },
        {
          ticker: 'HD',
          name: 'Home Depot',
          weight: 8,
          sector: 'Consumer Cyclical',
          assetClass: 'stocks',
          description: 'Home improvement retailer',
          rationale: '33 years of consecutive dividend increases'
        },
        {
          ticker: 'MMM',
          name: '3M Company',
          weight: 7,
          sector: 'Industrial',
          assetClass: 'stocks',
          description: 'Diversified industrial',
          rationale: '63 years of consecutive dividend increases'
        },
        {
          ticker: 'CVX',
          name: 'Chevron',
          weight: 7,
          sector: 'Energy',
          assetClass: 'stocks',
          description: 'Oil and gas company',
          rationale: '35 years of consecutive dividend increases'
        },
        {
          ticker: 'CAT',
          name: 'Caterpillar',
          weight: 6,
          sector: 'Industrial',
          assetClass: 'stocks',
          description: 'Construction equipment',
          rationale: '28 years of consecutive dividend increases'
        }
      ]
    }
  ];

  /**
   * Get all available templates
   */
  getTemplates(): PortfolioTemplate[] {
    return [...this.templates];
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: string): PortfolioTemplate[] {
    return this.templates.filter(template => template.category === category);
  }

  /**
   * Get template by ID
   */
  getTemplateById(id: string): PortfolioTemplate | null {
    return this.templates.find(template => template.id === id) || null;
  }

  /**
   * Get template categories
   */
  getCategories(): TemplateCategory[] {
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
   * Convert template to asset creation format
   */
  templateToAssets(template: PortfolioTemplate): AssetCreate[] {
    return template.assets.map(asset => ({
      ticker: asset.ticker,
      name: asset.name,
      weight: asset.weight / 100, // Convert percentage to decimal
      sector: asset.sector,
      assetClass: asset.assetClass,
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