
import { Contract } from "@/types/contract";
import { CategoryAnalytics, BrandPerformance, StatePerformance, CompetitorAnalytics, AnalyticsFilters } from "@/types/analytics";

export class AnalyticsService {
  static generateCategoryAnalytics(contracts: Contract[], filters?: AnalyticsFilters): CategoryAnalytics[] {
    // Filter contracts based on filters
    let filteredContracts = contracts;
    
    if (filters) {
      filteredContracts = contracts.filter(contract => {
        // Category filter
        if (filters.category.length > 0 && !filters.category.includes(contract.product.categoryName)) {
          return false;
        }
        
        // Brand filter
        if (filters.brand.length > 0 && !filters.brand.includes(contract.brand)) {
          return false;
        }
        
        // Date range filter
        if (filters.dateRange?.from && filters.dateRange?.to) {
          const contractDate = new Date(contract.contractDate);
          if (contractDate < filters.dateRange.from || contractDate > filters.dateRange.to) {
            return false;
          }
        }
        
        return true;
      });
    }

    // Group by category
    const categoryMap = new Map<string, Contract[]>();
    
    filteredContracts.forEach(contract => {
      const category = contract.product.categoryName;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(contract);
    });

    // Generate analytics for each category
    return Array.from(categoryMap.entries()).map(([categoryName, categoryContracts]) => {
      const totalContracts = categoryContracts.length;
      const totalValue = categoryContracts.reduce((sum, contract) => sum + contract.contractValue, 0);

      // Brand performance within category
      const brandMap = new Map<string, Contract[]>();
      categoryContracts.forEach(contract => {
        const brand = contract.brand;
        if (!brandMap.has(brand)) {
          brandMap.set(brand, []);
        }
        brandMap.get(brand)!.push(contract);
      });

      const brands: BrandPerformance[] = Array.from(brandMap.entries()).map(([brandName, brandContracts]) => {
        const contractCount = brandContracts.length;
        const contractValue = brandContracts.reduce((sum, contract) => sum + contract.contractValue, 0);
        const marketShare = (contractValue / totalValue) * 100;
        
        // Get unique states for this brand
        const activeStates = [...new Set(brandContracts.map(contract => 
          this.extractStateFromAddress(contract.buyer.buyerAddress)
        ))];

        return {
          brandName,
          contractCount,
          contractValue,
          marketShare,
          activeStates
        };
      });

      // State performance within category
      const stateMap = new Map<string, Contract[]>();
      categoryContracts.forEach(contract => {
        const state = this.extractStateFromAddress(contract.buyer.buyerAddress);
        if (!stateMap.has(state)) {
          stateMap.set(state, []);
        }
        stateMap.get(state)!.push(contract);
      });

      const states: StatePerformance[] = Array.from(stateMap.entries()).map(([stateName, stateContracts]) => {
        const contractCount = stateContracts.length;
        const contractValue = stateContracts.reduce((sum, contract) => sum + contract.contractValue, 0);

        // Brand performance within this state
        const stateBrandMap = new Map<string, Contract[]>();
        stateContracts.forEach(contract => {
          const brand = contract.brand;
          if (!stateBrandMap.has(brand)) {
            stateBrandMap.set(brand, []);
          }
          stateBrandMap.get(brand)!.push(contract);
        });

        const brands = Array.from(stateBrandMap.entries()).map(([brandName, brandStateContracts]) => ({
          brandName,
          contractCount: brandStateContracts.length,
          contractValue: brandStateContracts.reduce((sum, contract) => sum + contract.contractValue, 0),
          marketShare: (brandStateContracts.reduce((sum, contract) => sum + contract.contractValue, 0) / contractValue) * 100
        }));

        return {
          stateName,
          contractCount,
          contractValue,
          brands
        };
      });

      return {
        categoryName,
        totalContracts,
        totalValue,
        brands: brands.sort((a, b) => b.contractValue - a.contractValue),
        states: states.sort((a, b) => b.contractValue - a.contractValue)
      };
    }).sort((a, b) => b.totalValue - a.totalValue);
  }

  static generateCompetitorAnalytics(contracts: Contract[], userBrand: string, category: string): CompetitorAnalytics {
    // Filter contracts for the specific category
    const categoryContracts = contracts.filter(contract => 
      contract.product.categoryName === category
    );

    const totalCategoryValue = categoryContracts.reduce((sum, contract) => sum + contract.contractValue, 0);
    const totalCategoryContracts = categoryContracts.length;

    // User's performance in this category
    const userContracts = categoryContracts.filter(contract => contract.brand === userBrand);
    const userContractValue = userContracts.reduce((sum, contract) => sum + contract.contractValue, 0);
    const userMarketShare = totalCategoryValue > 0 ? (userContractValue / totalCategoryValue) * 100 : 0;

    // Competitor analysis
    const brandMap = new Map<string, Contract[]>();
    categoryContracts.forEach(contract => {
      if (contract.brand !== userBrand) {
        const brand = contract.brand;
        if (!brandMap.has(brand)) {
          brandMap.set(brand, []);
        }
        brandMap.get(brand)!.push(contract);
      }
    });

    const competitors: BrandPerformance[] = Array.from(brandMap.entries()).map(([brandName, brandContracts]) => {
      const contractCount = brandContracts.length;
      const contractValue = brandContracts.reduce((sum, contract) => sum + contract.contractValue, 0);
      const marketShare = (contractValue / totalCategoryValue) * 100;
      
      const activeStates = [...new Set(brandContracts.map(contract => 
        this.extractStateFromAddress(contract.buyer.buyerAddress)
      ))];

      return {
        brandName,
        contractCount,
        contractValue,
        marketShare,
        activeStates
      };
    }).sort((a, b) => b.contractValue - a.contractValue);

    // Location analysis
    const stateMap = new Map<string, Contract[]>();
    categoryContracts.forEach(contract => {
      const state = this.extractStateFromAddress(contract.buyer.buyerAddress);
      if (!stateMap.has(state)) {
        stateMap.set(state, []);
      }
      stateMap.get(state)!.push(contract);
    });

    const locationAnalysis: StatePerformance[] = Array.from(stateMap.entries()).map(([stateName, stateContracts]) => {
      const contractCount = stateContracts.length;
      const contractValue = stateContracts.reduce((sum, contract) => sum + contract.contractValue, 0);

      const stateBrandMap = new Map<string, Contract[]>();
      stateContracts.forEach(contract => {
        const brand = contract.brand;
        if (!stateBrandMap.has(brand)) {
          stateBrandMap.set(brand, []);
        }
        stateBrandMap.get(brand)!.push(contract);
      });

      const brands = Array.from(stateBrandMap.entries()).map(([brandName, brandStateContracts]) => ({
        brandName,
        contractCount: brandStateContracts.length,
        contractValue: brandStateContracts.reduce((sum, contract) => sum + contract.contractValue, 0),
        marketShare: (brandStateContracts.reduce((sum, contract) => sum + contract.contractValue, 0) / contractValue) * 100
      }));

      return {
        stateName,
        contractCount,
        contractValue,
        brands: brands.sort((a, b) => b.contractValue - a.contractValue)
      };
    });

    return {
      userBrand,
      category,
      totalCategoryValue,
      totalCategoryContracts,
      userPerformance: {
        contractCount: userContracts.length,
        contractValue: userContractValue,
        marketShare: userMarketShare
      },
      competitors,
      locationAnalysis: locationAnalysis.sort((a, b) => b.contractValue - a.contractValue)
    };
  }

  private static extractStateFromAddress(address: string): string {
    // Simple state extraction - in real app, use proper address parsing
    const addressParts = address.split(',').map(part => part.trim());
    // Assume state is usually the second last part before pincode
    if (addressParts.length >= 2) {
      return addressParts[addressParts.length - 2] || "Unknown";
    }
    return "Unknown";
  }

  static getUniqueCategories(contracts: Contract[]): string[] {
    return [...new Set(contracts.map(contract => contract.product.categoryName))].sort();
  }

  static getUniqueBrands(contracts: Contract[]): string[] {
    return [...new Set(contracts.map(contract => contract.brand))].sort();
  }

  static getUniqueStates(contracts: Contract[]): string[] {
    return [...new Set(contracts.map(contract => 
      this.extractStateFromAddress(contract.buyer.buyerAddress)
    ))].sort();
  }
}
