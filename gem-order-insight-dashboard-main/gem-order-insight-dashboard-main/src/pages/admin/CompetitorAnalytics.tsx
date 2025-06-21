
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryAnalytics } from "@/components/analytics/CategoryAnalytics";
import { AnalyticsFilters } from "@/components/analytics/AnalyticsFilters";
import { AnalyticsService } from "@/services/analyticsService";
import { mockData } from "@/data/mockData";
import { AnalyticsFilters as AnalyticsFiltersType } from "@/types/analytics";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, TrendingUp, Download, Settings } from "lucide-react";

const CompetitorAnalytics = () => {
  const { toast } = useToast();
  const [filters, setFilters] = useState<AnalyticsFiltersType>({
    category: [],
    brand: [],
    state: [],
    dateRange: { from: undefined, to: undefined }
  });

  const [availableOptions, setAvailableOptions] = useState({
    categories: [] as string[],
    brands: [] as string[],
    states: [] as string[]
  });

  const [categoryAnalytics, setCategoryAnalytics] = useState(
    AnalyticsService.generateCategoryAnalytics(mockData.contracts)
  );

  useEffect(() => {
    // Get available filter options
    setAvailableOptions({
      categories: AnalyticsService.getUniqueCategories(mockData.contracts),
      brands: AnalyticsService.getUniqueBrands(mockData.contracts),
      states: AnalyticsService.getUniqueStates(mockData.contracts)
    });
  }, []);

  useEffect(() => {
    // Regenerate analytics when filters change
    const newAnalytics = AnalyticsService.generateCategoryAnalytics(mockData.contracts, filters);
    setCategoryAnalytics(newAnalytics);
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      category: [],
      brand: [],
      state: [],
      dateRange: { from: undefined, to: undefined }
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Generating comprehensive analytics report...",
    });
    // In a real app, this would generate and download the report
  };

  const totalMarketValue = categoryAnalytics.reduce((sum, category) => sum + category.totalValue, 0);
  const totalContracts = categoryAnalytics.reduce((sum, category) => sum + category.totalContracts, 0);

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Competitor Analytics</h1>
            <p className="text-lg text-gray-600">
              Comprehensive market analysis and competitive intelligence
            </p>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handleExportData}
            >
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Configure Access
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Market Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{(totalMarketValue / 10000000).toFixed(1)}Cr</div>
              <p className="text-xs text-muted-foreground">
                Filtered data
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categoryAnalytics.length}</div>
              <p className="text-xs text-muted-foreground">
                Product categories
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalContracts}</div>
              <p className="text-xs text-muted-foreground">
                Active contracts
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Competing Brands</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(categoryAnalytics.flatMap(cat => cat.brands.map(brand => brand.brandName))).size}
              </div>
              <p className="text-xs text-muted-foreground">
                Unique brands
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <AnalyticsFilters
          filters={filters}
          onFiltersChange={setFilters}
          availableCategories={availableOptions.categories}
          availableBrands={availableOptions.brands}
          availableStates={availableOptions.states}
          onReset={handleResetFilters}
        />

        {/* Analytics Content */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Market Overview</TabsTrigger>
            <TabsTrigger value="categories">Category Analysis</TabsTrigger>
            <TabsTrigger value="access">Access Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <CategoryAnalytics data={categoryAnalytics} filters={filters} />
          </TabsContent>
          
          <TabsContent value="categories" className="space-y-6">
            <CategoryAnalytics data={categoryAnalytics} filters={filters} />
          </TabsContent>
          
          <TabsContent value="access" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Access Management</CardTitle>
                <CardDescription>
                  Control which OEM/User accounts can access competitor analytics features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    Access management features will be implemented here
                  </p>
                  <Button variant="outline">
                    Configure User Access
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CompetitorAnalytics;
