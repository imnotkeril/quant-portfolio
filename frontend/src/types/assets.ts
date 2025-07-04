// types/assets.ts
export interface BaseAsset {
  ticker: string;
  name: string;
  currentPrice?: number;
  sector?: string;
  industry?: string;
  exchange?: string;
  assetClass?: AssetClass;
  country?: string;
  currency?: string;
}

export interface AssetFormData extends BaseAsset {
  id: string;
  weight: number;
  // Optional fields for professional mode
  quantity?: number;
  purchasePrice?: number;
  purchaseDate?: string;
  targetWeight?: number;
  minWeight?: number;
  maxWeight?: number;
}

export interface AssetCreate {
  ticker: string;
  name?: string;
  weight?: number;
  quantity?: number;
  purchasePrice?: number;
  purchaseDate?: string;
  targetWeight?: number;
  minWeight?: number;
  maxWeight?: number;
}

export type AssetClass =
  | 'stocks'
  | 'etf'
  | 'mutual_fund'
  | 'bonds'
  | 'commodities'
  | 'crypto'
  | 'real_estate'
  | 'cash'
  | 'options'
  | 'futures';

export interface AssetTemplate {
  name: string;
  description: string;
  assets: AssetFormData[];
  category: 'conservative' | 'moderate' | 'aggressive' | 'custom';
  riskLevel: 1 | 2 | 3 | 4 | 5;
}

export interface AssetSearchResult extends BaseAsset {
  symbol: string;
  marketCap?: number;
  volume?: number;
  beta?: number;
  peRatio?: number;
  dividendYield?: number;
}

// Asset validation constraints
export interface AssetConstraints {
  maxWeightPerAsset: number;
  minWeightPerAsset: number;
  maxAssetsPerSector: number;
  allowedAssetClasses: AssetClass[];
  allowedCountries: string[];
  allowedExchanges: string[];
}

// Form modes
export type AssetFormMode = 'easy' | 'professional';

export interface AssetFormProps {
  mode: AssetFormMode;
  onAssetAdd: (asset: AssetFormData) => void;
  onAssetUpdate: (id: string, asset: Partial<AssetFormData>) => void;
  onAssetRemove: (id: string) => void;
  existingAssets: AssetFormData[];
  constraints?: AssetConstraints;
  templates?: AssetTemplate[];
  remainingWeight: number;
}