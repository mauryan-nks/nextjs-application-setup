
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CompetitorAnalytics } from "@/components/analytics/CompetitorAnalytics";
import { AnalyticsService } from "@/services/analyticsService";
import { mockData } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Lock, TrendingUp, BarChart3, Eye } from "lucide-react";

const UserAnalytics = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [competitorAnalytics, setCompetitorAnalytics] = useState<any>(null);

  // Check if user has access to competitor analytics
  const hasAnalyticsAccess = user?.panelAccess?.analytics || false;
  const userBrand = user?.brands?.[0] || "Unknown Brand";

  useEffect(() => {
    if (!hasAnalyticsAccess) return;

    // Get categories where user's brand is active
    const userCategories = mockData.contracts
      .filter(contract => contract.brand === userBrand)
      .map(contract => contract.product.categoryName);
    
    const uniqueCategories = [...new Set(userCategories)];
    setAvailableCategories(uniqueCategories);
    
    if (uniqueCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(uniqueCategories[0]);
    }
  }, [hasAnalyticsAccess, userBrand, selectedCategory]);

  useEffect(() => {
    if (hasAnalyticsAccess && selectedCategory && userBrand) {
      const analytics = AnalyticsService.generateCompetitorAnalytics(
        mockData.contracts,
        userBrand,
        selectedCategory
      );
      setCompetitorAnalytics(analytics);
    }
  }, [hasAnalyticsAccess, selectedCategory, userBrand]);

  const handleRequestAccess = () => {
    toast({
      title: "Access Request Sent",
      description: "Your request for competitor analytics access has been sent to the administrator.",
    });
  };

  if (!hasAnalyticsAccess) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-8">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                <Lock className="h-12 w-12 text-gray-400" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Competitor Analytics</h1>
              <p className="text-lg text-gray-600">
                Unlock powerful market insights and competitive intelligence
              </p>
            </div>

            <Card className="text-left">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Premium Analytics Features
                </CardTitle>
                <CardDescription>
                  Get detailed insights into your market performance and competition
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">Market Share Analysis</h4>
                      <p className="text-sm text-gray-600">See your position vs competitors</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">Revenue Comparison</h4>
                      <p className="text-sm text-gray-600">Compare performance metrics</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">Geographic Analysis</h4>
                      <p className="text-sm text-gray-600">State-wise market insights</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">Category Intelligence</h4>
                      <p className="text-sm text-gray-600">Category-specific analytics</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Access Required</p>
                      <p className="text-sm text-gray-600">Contact admin for premium analytics access</p>
                    </div>
                    <Button onClick={handleRequestAccess}>
                      Request Access
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Eye className="h-8 w-8 text-blue-600" />
              Market Intelligence
            </h1>
            <p className="text-lg text-gray-600">
              Analyze your competitive position in <Badge variant="outline">{userBrand}</Badge>
            </p>
          </div>
          <div className="text-right">
            <Badge className="bg-green-100 text-green-800">
              Premium Access Enabled
            </Badge>
          </div>
        </div>

        {/* Category Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Category for Analysis</CardTitle>
            <CardDescription>
              Choose a product category where your brand is active to view competitive insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-600">
                {availableCategories.length} categories available for your brand
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Content */}
        {competitorAnalytics && selectedCategory && (
          <CompetitorAnalytics data={competitorAnalytics} />
        )}

        {!selectedCategory && (
          <Card>
            <CardContent className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Category</h3>
              <p className="text-gray-600">
                Choose a product category above to start analyzing your competitive position
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserAnalytics;
