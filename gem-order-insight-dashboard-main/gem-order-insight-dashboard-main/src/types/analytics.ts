
export interface CategoryAnalytics {
  categoryName: string;
  totalContracts: number;
  totalValue: number;
  brands: BrandPerformance[];
  states: StatePerformance[];
}

export interface BrandPerformance {
  brandName: string;
  contractCount: number;
  contractValue: number;
  marketShare: number;
  activeStates: string[];
}

export interface StatePerformance {
  stateName: string;
  contractCount: number;
  contractValue: number;
  brands: BrandStateData[];
}

export interface BrandStateData {
  brandName: string;
  contractCount: number;
  contractValue: number;
  marketShare: number;
}

export interface CompetitorAnalytics {
  userBrand: string;
  category: string;
  totalCategoryValue: number;
  totalCategoryContracts: number;
  userPerformance: {
    contractCount: number;
    contractValue: number;
    marketShare: number;
  };
  competitors: BrandPerformance[];
  locationAnalysis: StatePerformance[];
}

export interface AnalyticsFilters {
  category: string[];
  brand: string[];
  state: string[];
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}
