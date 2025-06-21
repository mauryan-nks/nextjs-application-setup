
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import { BrandSwitcher } from "@/components/BrandSwitcher";
import { ContractsTable } from "@/components/ContractsTable";
import { DateRangePicker } from "@/components/DateRangePicker";
import { FilterBar } from "@/components/FilterBar";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { ExportOptions } from "@/components/ExportOptions";
import { mockData } from "@/data/mockData";
import { Filter } from "@/types/filters";

const Index = () => {
  const [selectedBrand, setSelectedBrand] = useState<string>('All Brands');
  const [filters, setFilters] = useState<Filter>({
    dateRange: { from: undefined, to: undefined },
    contractStatus: [],
    procurementType: [],
    catalogueStatus: [],
    sellerVerification: []
  });
  
  // Filter data based on selected filters
  const filteredData = mockData.contracts.filter(contract => {
    // Filter by brand
    if (selectedBrand !== 'All Brands' && contract.brand !== selectedBrand) {
      return false;
    }
    
    // Filter by date range
    if (filters.dateRange.from && filters.dateRange.to) {
      const contractDate = new Date(contract.contractDate);
      const fromDate = new Date(filters.dateRange.from);
      const toDate = new Date(filters.dateRange.to);
      if (contractDate < fromDate || contractDate > toDate) {
        return false;
      }
    }
    
    // Filter by contract status
    if (filters.contractStatus.length > 0 && !filters.contractStatus.includes(contract.contractStatus)) {
      return false;
    }
    
    // Filter by procurement type
    if (filters.procurementType.length > 0 && !filters.procurementType.includes(contract.procurementType)) {
      return false;
    }
    
    return true;
  });

  // Calculate total order value
  const totalOrderValue = filteredData.reduce((sum, contract) => sum + contract.contractValue, 0);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">OEM Order Analytics</h1>
            <p className="text-gray-600">Track and analyze product performance across brands</p>
          </div>
          <BrandSwitcher 
            selectedBrand={selectedBrand} 
            setSelectedBrand={setSelectedBrand} 
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Contracts</CardTitle>
              <CardDescription>Current selection</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{filteredData.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Order Value</CardTitle>
              <CardDescription>Current selection</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">₹{totalOrderValue.toLocaleString()}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Active Sellers</CardTitle>
              <CardDescription>Current selection</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {new Set(filteredData.map(contract => contract.seller.sellerName)).size}
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <DateRangePicker 
                  onChange={(range) => setFilters({...filters, dateRange: range})} 
                />
                <FilterBar filters={filters} setFilters={setFilters} />
                <div className="ml-auto">
                  <ExportOptions data={filteredData} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-8">
          <AnalyticsCharts data={filteredData} />
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Contracts</CardTitle>
            </CardHeader>
            <CardContent>
              <ContractsTable data={filteredData} />
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default Index;
