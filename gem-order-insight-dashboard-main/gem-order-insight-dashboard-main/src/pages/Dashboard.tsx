
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandSwitcher } from "@/components/BrandSwitcher";
import { DateRangePicker } from "@/components/DateRangePicker";
import { FilterBar } from "@/components/FilterBar";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { ExportOptions } from "@/components/ExportOptions";
import { mockData } from "@/data/mockData";
import { Filter } from "@/types/filters";
import { DashboardLayout } from '@/components/DashboardLayout';
import { FileSpreadsheet, BarChart3, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const [selectedBrand, setSelectedBrand] = useState<string>('All Brands');
  const [filters, setFilters] = useState<Filter>({
    dateRange: { from: undefined, to: undefined },
    contractStatus: [],
    procurementType: [],
    catalogueStatus: [],
    sellerVerification: []
  });
  
  const navigate = useNavigate();
  
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
  
  // Handle reset filters
  const handleResetFilters = () => {
    setFilters({
      dateRange: { from: undefined, to: undefined },
      contractStatus: [],
      procurementType: [],
      catalogueStatus: [],
      sellerVerification: []
    });
  };
  
  return (
    <DashboardLayout>
      <div>
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
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/contracts')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-blue-500" />
                Total Contracts
              </CardTitle>
              <CardDescription>Current selection</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{filteredData.length}</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/orders')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-green-500" />
                Total Order Value
              </CardTitle>
              <CardDescription>Current selection</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">₹{totalOrderValue.toLocaleString()}</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/sellers')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                Active Sellers
              </CardTitle>
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
                
                <Button 
                  variant="outline" 
                  onClick={handleResetFilters}
                  className="h-10"
                >
                  Reset Filters
                </Button>
                
                <div className="ml-auto">
                  <ExportOptions data={filteredData} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/analytics')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Analytics Overview
                <Button variant="ghost" size="sm" className="ml-auto">
                  View Full Analytics
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnalyticsCharts data={filteredData} />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/contracts')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-blue-500" />
                Recent Contracts
                <Button variant="ghost" size="sm" className="ml-auto">
                  View All Contracts
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8">
                <Button onClick={() => navigate('/contracts')}>
                  View Contracts Table
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
