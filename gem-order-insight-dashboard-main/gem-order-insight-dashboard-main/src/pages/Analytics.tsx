
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { mockData } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/DateRangePicker";
import { SearchableSelect } from "@/components/SearchableSelect";
import { DateRange } from "@/types/filters";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Analytics = () => {
  const { toast } = useToast();
  const [filters, setFilters] = useState<{
    brandName: string;
    contractStatus: string;
    procurementType: string;
    dateRange: DateRange;
  }>({
    brandName: "",
    contractStatus: "",
    procurementType: "",
    dateRange: { from: undefined, to: undefined }
  });
  const [showFilters, setShowFilters] = useState(false);

  // Filter data based on selected filters
  const filteredData = mockData.contracts.filter(contract => {
    // Brand filter
    if (filters.brandName && contract.brand !== filters.brandName) {
      return false;
    }
    
    // Status filter
    if (filters.contractStatus && contract.contractStatus !== filters.contractStatus) {
      return false;
    }
    
    // Procurement type filter
    if (filters.procurementType && contract.procurementType !== filters.procurementType) {
      return false;
    }
    
    // Date range filter
    if (filters.dateRange.from instanceof Date && 
        filters.dateRange.to instanceof Date) {
      const contractDate = new Date(contract.contractDate);
      if (contractDate < filters.dateRange.from || contractDate > filters.dateRange.to) {
        return false;
      }
    }
    
    return true;
  });

  // Extract unique values for filters
  const uniqueBrands = [...new Set(mockData.contracts.map(contract => contract.brand))];
  const uniqueStatuses = [...new Set(mockData.contracts.map(contract => contract.contractStatus))];
  const uniqueProcurementTypes = [...new Set(mockData.contracts.map(contract => contract.procurementType))];

  const resetFilters = () => {
    setFilters({
      brandName: "",
      contractStatus: "",
      procurementType: "",
      dateRange: { from: undefined, to: undefined }
    });
    
    toast({
      title: "Filters Reset",
      description: "All filters have been cleared."
    });
  };

  const handleDateRangeChange = (range: DateRange) => {
    setFilters({...filters, dateRange: range});
    if (range.from && range.to) {
      toast({
        title: "Date Range Applied",
        description: `Filtering from ${range.from.toLocaleDateString()} to ${range.to.toLocaleDateString()}`
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
        
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex justify-between items-center">
              <span>Filter Analytics Data</span>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 lg:px-3"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 lg:px-3"
                  onClick={resetFilters}
                  disabled={!filters.brandName && !filters.contractStatus && !filters.procurementType && !filters.dateRange.from && !filters.dateRange.to}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <DateRangePicker
                  onChange={handleDateRangeChange}
                  value={filters.dateRange}
                />
              </div>
              
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Brand</label>
                    <SearchableSelect 
                      options={uniqueBrands}
                      placeholder="Select Brand"
                      value={filters.brandName}
                      onChange={(value) => setFilters({...filters, brandName: value})}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Contract Status</label>
                    <SearchableSelect 
                      options={uniqueStatuses}
                      placeholder="Select Status"
                      value={filters.contractStatus}
                      onChange={(value) => setFilters({...filters, contractStatus: value})}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Procurement Type</label>
                    <SearchableSelect 
                      options={uniqueProcurementTypes}
                      placeholder="Select Type"
                      value={filters.procurementType}
                      onChange={(value) => setFilters({...filters, procurementType: value})}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Performance Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsCharts data={filteredData} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
