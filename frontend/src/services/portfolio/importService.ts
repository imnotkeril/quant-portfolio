/**
 * Import service
 * Handles portfolio import from CSV and text formats
 */
import { AssetCreate } from '../../types/portfolio';

/**
 * Import validation result
 */
export interface ImportValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  assets: ParsedAsset[];
}

/**
 * Parsed asset from import
 */
export interface ParsedAsset {
  ticker: string;
  name?: string;
  weight?: number;
  quantity?: number;
  purchasePrice?: number;
  purchaseDate?: string;
  currentPrice?: number;
  sector?: string;
  industry?: string;
  assetClass?: string;
  currency?: string;
  country?: string;
  exchange?: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  lineNumber?: number;
}

/**
 * CSV parsing options
 */
export interface CSVParseOptions {
  delimiter?: string;
  hasHeaders?: boolean;
  skipEmptyLines?: boolean;
  trimValues?: boolean;
  validateWeights?: boolean;
  normalizeWeights?: boolean;
}

/**
 * Text parsing options
 */
export interface TextParseOptions {
  format?: 'ticker-weight' | 'ticker-quantity' | 'free-form';
  separator?: string;
  weightUnit?: 'percentage' | 'decimal';
  validateWeights?: boolean;
  normalizeWeights?: boolean;
}

/**
 * Import Service class
 */
class ImportService {
  /**
   * Parse CSV file content
   */
  parseCSV(
    csvContent: string,
    options: CSVParseOptions = {}
  ): ImportValidationResult {
    const {
      delimiter = ',',
      hasHeaders = true,
      skipEmptyLines = true,
      trimValues = true,
      validateWeights = true,
      normalizeWeights = false
    } = options;

    const errors: string[] = [];
    const warnings: string[] = [];
    const assets: ParsedAsset[] = [];

    try {
      // Split content into lines
      const lines = csvContent.split('\n').filter(line =>
        skipEmptyLines ? line.trim() : true
      );

      if (lines.length === 0) {
        errors.push('CSV file is empty');
        return { isValid: false, errors, warnings, assets };
      }

      // Parse headers
      let headerLine = 0;
      let headers: string[] = [];

      if (hasHeaders) {
        headers = this.parseCSVLine(lines[0], delimiter, trimValues);
        headerLine = 1;
      } else {
        // Default headers if no headers provided
        headers = ['ticker', 'name', 'weight', 'quantity', 'purchasePrice', 'purchaseDate'];
      }

      // Normalize headers
      const normalizedHeaders = headers.map(h => h.toLowerCase().trim());

      // Find required column indices
      const columnIndices = this.findColumnIndices(normalizedHeaders);

      if (columnIndices.ticker === -1) {
        errors.push('CSV must contain a ticker/symbol column');
        return { isValid: false, errors, warnings, assets };
      }

      // Parse data rows
      for (let i = headerLine; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = this.parseCSVLine(line, delimiter, trimValues);
        const asset = this.parseCSVRow(values, columnIndices, i + 1);

        if (asset) {
          assets.push(asset);
        }
      }

      // Validate parsed assets
      const validationResult = this.validateParsedAssets(assets, validateWeights);
      errors.push(...validationResult.errors);
      warnings.push(...validationResult.warnings);

      // Normalize weights if requested
      if (normalizeWeights && assets.length > 0) {
        const normalizedAssets = this.normalizeAssetWeights(assets);
        assets.splice(0, assets.length, ...normalizedAssets);
        warnings.push('Asset weights have been normalized to sum to 100%');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        assets
      };

    } catch (error) {
      errors.push(`Error parsing CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, errors, warnings, assets };
    }
  }

  /**
   * Parse text content
   */
  parseText(
    textContent: string,
    options: TextParseOptions = {}
  ): ImportValidationResult {
    const {
      format = 'ticker-weight',
      separator = ',',
      weightUnit = 'percentage',
      validateWeights = true,
      normalizeWeights = false
    } = options;

    const errors: string[] = [];
    const warnings: string[] = [];
    const assets: ParsedAsset[] = [];

    try {
      // Split content into lines
      const lines = textContent.split('\n').filter(line => line.trim());

      if (lines.length === 0) {
        errors.push('Text content is empty');
        return { isValid: false, errors, warnings, assets };
      }

      // Parse each line based on format
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const asset = this.parseTextLine(line, format, separator, weightUnit, i + 1);

        if (asset) {
          assets.push(asset);
        } else {
          warnings.push(`Line ${i + 1}: Could not parse "${line}"`);
        }
      }

      // Validate parsed assets
      const validationResult = this.validateParsedAssets(assets, validateWeights);
      errors.push(...validationResult.errors);
      warnings.push(...validationResult.warnings);

      // Normalize weights if requested
      if (normalizeWeights && assets.length > 0) {
        const normalizedAssets = this.normalizeAssetWeights(assets);
        assets.splice(0, assets.length, ...normalizedAssets);
        warnings.push('Asset weights have been normalized to sum to 100%');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        assets
      };

    } catch (error) {
      errors.push(`Error parsing text: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, errors, warnings, assets };
    }
  }

  /**
   * Convert parsed assets to AssetCreate format
   */
  parsedAssetsToAssetCreate(assets: ParsedAsset[]): AssetCreate[] {
    return assets
      .filter(asset => asset.isValid)
      .map(asset => ({
        ticker: asset.ticker.toUpperCase(),
        name: asset.name,
        weight: asset.weight ? asset.weight / 100 : undefined, // Convert percentage to decimal
        quantity: asset.quantity,
        purchasePrice: asset.purchasePrice,
        purchaseDate: asset.purchaseDate,
        currentPrice: asset.currentPrice,
        sector: asset.sector,
        industry: asset.industry,
        assetClass: asset.assetClass,
        currency: asset.currency,
        country: asset.country,
        exchange: asset.exchange,
      }));
  }

  /**
   * Generate CSV template
   */
  generateCSVTemplate(): string {
    const headers = [
      'Ticker',
      'Name',
      'Weight',
      'Quantity',
      'Purchase Price',
      'Purchase Date',
      'Sector',
      'Industry',
      'Asset Class',
      'Currency',
      'Country',
      'Exchange'
    ];

    const sampleData = [
      ['AAPL', 'Apple Inc.', '25.0', '100', '150.00', '2024-01-15', 'Technology', 'Consumer Electronics', 'stocks', 'USD', 'US', 'NASDAQ'],
      ['MSFT', 'Microsoft Corp.', '20.0', '50', '300.00', '2024-01-15', 'Technology', 'Software', 'stocks', 'USD', 'US', 'NASDAQ'],
      ['GOOGL', 'Alphabet Inc.', '15.0', '25', '140.00', '2024-01-15', 'Technology', 'Internet', 'stocks', 'USD', 'US', 'NASDAQ'],
      ['AMZN', 'Amazon.com Inc.', '15.0', '30', '160.00', '2024-01-15', 'Consumer Discretionary', 'E-commerce', 'stocks', 'USD', 'US', 'NASDAQ'],
      ['TSLA', 'Tesla Inc.', '10.0', '40', '200.00', '2024-01-15', 'Consumer Discretionary', 'Automotive', 'stocks', 'USD', 'US', 'NASDAQ'],
      ['BRK.B', 'Berkshire Hathaway', '10.0', '200', '350.00', '2024-01-15', 'Financial Services', 'Conglomerates', 'stocks', 'USD', 'US', 'NYSE'],
      ['JNJ', 'Johnson & Johnson', '5.0', '60', '170.00', '2024-01-15', 'Healthcare', 'Pharmaceuticals', 'stocks', 'USD', 'US', 'NYSE']
    ];

    return [headers.join(','), ...sampleData.map(row => row.join(','))].join('\n');
  }

  /**
   * Generate text template
   */
  generateTextTemplate(format: 'ticker-weight' | 'ticker-quantity' | 'free-form' = 'ticker-weight'): string {
    switch (format) {
      case 'ticker-weight':
        return `AAPL 25%
MSFT 20%
GOOGL 15%
AMZN 15%
TSLA 10%
BRK.B 10%
JNJ 5%`;

      case 'ticker-quantity':
        return `AAPL 100
MSFT 50
GOOGL 25
AMZN 30
TSLA 40
BRK.B 200
JNJ 60`;

      case 'free-form':
        return `Apple Inc. (AAPL) - 25% allocation
Microsoft Corporation (MSFT) - 20% weight
Alphabet Inc. (GOOGL) - 15%
Amazon.com Inc. (AMZN) - 15%
Tesla Inc. (TSLA) - 10%
Berkshire Hathaway (BRK.B) - 10%
Johnson & Johnson (JNJ) - 5%`;

      default:
        return this.generateTextTemplate('ticker-weight');
    }
  }

  /**
   * Parse CSV line
   */
  private parseCSVLine(line: string, delimiter: string, trimValues: boolean): string[] {
    const values: string[] = [];
    let currentValue = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];

      if (char === '"' && !inQuotes) {
        inQuotes = true;
      } else if (char === '"' && inQuotes) {
        if (line[i + 1] === '"') {
          currentValue += '"';
          i++; // Skip next quote
        } else {
          inQuotes = false;
        }
      } else if (char === delimiter && !inQuotes) {
        values.push(trimValues ? currentValue.trim() : currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }

      i++;
    }

    values.push(trimValues ? currentValue.trim() : currentValue);
    return values;
  }

  /**
   * Find column indices
   */
  private findColumnIndices(headers: string[]): Record<string, number> {
    const indices: Record<string, number> = {
      ticker: -1,
      name: -1,
      weight: -1,
      quantity: -1,
      purchasePrice: -1,
      purchaseDate: -1,
      currentPrice: -1,
      sector: -1,
      industry: -1,
      assetClass: -1,
      currency: -1,
      country: -1,
      exchange: -1
    };

    headers.forEach((header, index) => {
      const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Ticker synonyms
      if (['ticker', 'symbol', 'stock', 'asset'].includes(normalizedHeader)) {
        indices.ticker = index;
      }
      // Name synonyms
      else if (['name', 'company', 'companyname', 'title'].includes(normalizedHeader)) {
        indices.name = index;
      }
      // Weight synonyms
      else if (['weight', 'allocation', 'percentage', 'percent', 'share'].includes(normalizedHeader)) {
        indices.weight = index;
      }
      // Quantity synonyms
      else if (['quantity', 'shares', 'units', 'amount'].includes(normalizedHeader)) {
        indices.quantity = index;
      }
      // Purchase price synonyms
      else if (['purchaseprice', 'buyprice', 'price', 'cost', 'entryprice'].includes(normalizedHeader)) {
        indices.purchasePrice = index;
      }
      // Purchase date synonyms
      else if (['purchasedate', 'buydate', 'date', 'entrydate'].includes(normalizedHeader)) {
        indices.purchaseDate = index;
      }
      // Current price synonyms
      else if (['currentprice', 'marketprice', 'lastprice'].includes(normalizedHeader)) {
        indices.currentPrice = index;
      }
      // Sector synonyms
      else if (['sector', 'industry', 'category'].includes(normalizedHeader)) {
        indices.sector = index;
      }
      // Asset class synonyms
      else if (['assetclass', 'type', 'class', 'assettype'].includes(normalizedHeader)) {
        indices.assetClass = index;
      }
      // Currency synonyms
      else if (['currency', 'curr', 'ccy'].includes(normalizedHeader)) {
        indices.currency = index;
      }
      // Country synonyms
      else if (['country', 'nation', 'region'].includes(normalizedHeader)) {
        indices.country = index;
      }
      // Exchange synonyms
      else if (['exchange', 'market', 'listing'].includes(normalizedHeader)) {
        indices.exchange = index;
      }
    });

    return indices;
  }

  /**
   * Parse CSV row
   */
  private parseCSVRow(values: string[], columnIndices: Record<string, number>, lineNumber: number): ParsedAsset | null {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Extract ticker (required)
    const ticker = columnIndices.ticker >= 0 ? values[columnIndices.ticker]?.trim() : '';
    if (!ticker) {
      errors.push(`Line ${lineNumber}: Ticker is required`);
      return null;
    }

    // Extract other fields
    const name = columnIndices.name >= 0 ? values[columnIndices.name]?.trim() : undefined;
    const weightStr = columnIndices.weight >= 0 ? values[columnIndices.weight]?.trim() : '';
    const quantityStr = columnIndices.quantity >= 0 ? values[columnIndices.quantity]?.trim() : '';
    const purchasePriceStr = columnIndices.purchasePrice >= 0 ? values[columnIndices.purchasePrice]?.trim() : '';
    const purchaseDate = columnIndices.purchaseDate >= 0 ? values[columnIndices.purchaseDate]?.trim() : undefined;
    const currentPriceStr = columnIndices.currentPrice >= 0 ? values[columnIndices.currentPrice]?.trim() : '';
    const sector = columnIndices.sector >= 0 ? values[columnIndices.sector]?.trim() : undefined;
    const industry = columnIndices.industry >= 0 ? values[columnIndices.industry]?.trim() : undefined;
    const assetClass = columnIndices.assetClass >= 0 ? values[columnIndices.assetClass]?.trim() : undefined;
    const currency = columnIndices.currency >= 0 ? values[columnIndices.currency]?.trim() : undefined;
    const country = columnIndices.country >= 0 ? values[columnIndices.country]?.trim() : undefined;
    const exchange = columnIndices.exchange >= 0 ? values[columnIndices.exchange]?.trim() : undefined;

    // Parse numeric values
    const weight = this.parseNumericValue(weightStr, 'weight', lineNumber, errors);
    const quantity = this.parseNumericValue(quantityStr, 'quantity', lineNumber, errors);
    const purchasePrice = this.parseNumericValue(purchasePriceStr, 'purchase price', lineNumber, errors);
    const currentPrice = this.parseNumericValue(currentPriceStr, 'current price', lineNumber, errors);

    // Validate ticker format
    if (!/^[A-Z0-9.-]+$/i.test(ticker)) {
      warnings.push(`Line ${lineNumber}: Ticker "${ticker}" may not be valid`);
    }

    // Validate weight range
    if (weight !== undefined && (weight < 0 || weight > 100)) {
      errors.push(`Line ${lineNumber}: Weight must be between 0 and 100`);
    }

    // Validate quantity
    if (quantity !== undefined && quantity <= 0) {
      errors.push(`Line ${lineNumber}: Quantity must be greater than 0`);
    }

    // Validate prices
    if (purchasePrice !== undefined && purchasePrice <= 0) {
      errors.push(`Line ${lineNumber}: Purchase price must be greater than 0`);
    }

    if (currentPrice !== undefined && currentPrice <= 0) {
      errors.push(`Line ${lineNumber}: Current price must be greater than 0`);
    }

    return {
      ticker: ticker.toUpperCase(),
      name,
      weight,
      quantity,
      purchasePrice,
      purchaseDate,
      currentPrice,
      sector,
      industry,
      assetClass,
      currency,
      country,
      exchange,
      isValid: errors.length === 0,
      errors,
      warnings,
      lineNumber
    };
  }

  /**
   * Parse text line
   */
  private parseTextLine(
    line: string,
    format: string,
    separator: string,
    weightUnit: string,
    lineNumber: number
  ): ParsedAsset | null {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      let ticker = '';
      let weight: number | undefined;
      let quantity: number | undefined;
      let name: string | undefined;

      switch (format) {
        case 'ticker-weight':
          const tickerWeightMatch = line.match(/^([A-Z0-9.-]+)\s*[:\s]\s*(\d+(?:\.\d+)?)%?$/i);
          if (tickerWeightMatch) {
            ticker = tickerWeightMatch[1].trim();
            weight = parseFloat(tickerWeightMatch[2]);
            if (weightUnit === 'decimal' && weight <= 1) {
              weight *= 100; // Convert decimal to percentage
            }
          }
          break;

        case 'ticker-quantity':
          const tickerQuantityMatch = line.match(/^([A-Z0-9.-]+)\s*[:\s]\s*(\d+(?:\.\d+)?)$/i);
          if (tickerQuantityMatch) {
            ticker = tickerQuantityMatch[1].trim();
            quantity = parseFloat(tickerQuantityMatch[2]);
          }
          break;

        case 'free-form':
          // Try to extract ticker from parentheses
          const tickerParenMatch = line.match(/\(([A-Z0-9.-]+)\)/i);
          if (tickerParenMatch) {
            ticker = tickerParenMatch[1].trim();
          }

          // Try to extract weight/percentage
          const weightMatch = line.match(/(\d+(?:\.\d+)?)%/);
          if (weightMatch) {
            weight = parseFloat(weightMatch[1]);
          }

          // Try to extract name (text before parentheses)
          const nameMatch = line.match(/^([^(]+)\s*\(/);
          if (nameMatch) {
            name = nameMatch[1].trim();
          }
          break;
      }

      if (!ticker) {
        errors.push(`Line ${lineNumber}: Could not extract ticker from "${line}"`);
        return null;
      }

      // Validate ticker format
      if (!/^[A-Z0-9.-]+$/i.test(ticker)) {
        warnings.push(`Line ${lineNumber}: Ticker "${ticker}" may not be valid`);
      }

      // Validate weight range
      if (weight !== undefined && (weight < 0 || weight > 100)) {
        errors.push(`Line ${lineNumber}: Weight must be between 0 and 100`);
      }

      // Validate quantity
      if (quantity !== undefined && quantity <= 0) {
        errors.push(`Line ${lineNumber}: Quantity must be greater than 0`);
      }

      return {
        ticker: ticker.toUpperCase(),
        name,
        weight,
        quantity,
        purchasePrice: undefined,
        purchaseDate: undefined,
        currentPrice: undefined,
        sector: undefined,
        industry: undefined,
        assetClass: undefined,
        currency: undefined,
        country: undefined,
        exchange: undefined,
        isValid: errors.length === 0,
        errors,
        warnings,
        lineNumber
      };

    } catch (error) {
      errors.push(`Line ${lineNumber}: Parse error - ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  }

  /**
   * Parse numeric value
   */
  private parseNumericValue(
    value: string,
    fieldName: string,
    lineNumber: number,
    errors: string[]
  ): number | undefined {
    if (!value) return undefined;

    // Remove percentage sign and other non-numeric characters
    const cleanValue = value.replace(/[%$,]/g, '');
    const parsed = parseFloat(cleanValue);

    if (isNaN(parsed)) {
      errors.push(`Line ${lineNumber}: Invalid ${fieldName} value "${value}"`);
      return undefined;
    }

    return parsed;
  }

  /**
   * Validate parsed assets
   */
  private validateParsedAssets(
    assets: ParsedAsset[],
    validateWeights: boolean
  ): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (assets.length === 0) {
      errors.push('No valid assets found');
      return { errors, warnings };
    }

    // Check for duplicate tickers
    const tickers = new Set<string>();
    const duplicates = new Set<string>();

    assets.forEach(asset => {
      if (tickers.has(asset.ticker)) {
        duplicates.add(asset.ticker);
      }
      tickers.add(asset.ticker);
    });

    if (duplicates.size > 0) {
      errors.push(`Duplicate tickers found: ${Array.from(duplicates).join(', ')}`);
    }

    // Validate weights sum
    if (validateWeights) {
      const assetsWithWeights = assets.filter(asset => asset.weight !== undefined);

      if (assetsWithWeights.length > 0) {
        const totalWeight = assetsWithWeights.reduce((sum, asset) => sum + (asset.weight || 0), 0);

        if (Math.abs(totalWeight - 100) > 0.01) {
          if (totalWeight > 100) {
            errors.push(`Total weight exceeds 100% (${totalWeight.toFixed(2)}%)`);
          } else {
            warnings.push(`Total weight is less than 100% (${totalWeight.toFixed(2)}%)`);
          }
        }
      }
    }

    return { errors, warnings };
  }

  /**
   * Normalize asset weights
   */
  private normalizeAssetWeights(assets: ParsedAsset[]): ParsedAsset[] {
    const assetsWithWeights = assets.filter(asset => asset.weight !== undefined);

    if (assetsWithWeights.length === 0) {
      return assets;
    }

    const totalWeight = assetsWithWeights.reduce((sum, asset) => sum + (asset.weight || 0), 0);

    if (totalWeight === 0) {
      return assets;
    }

    return assets.map(asset => ({
      ...asset,
      weight: asset.weight !== undefined ? (asset.weight / totalWeight) * 100 : undefined
    }));
  }
}

// Export singleton instance
export const importService = new ImportService();
export default importService;