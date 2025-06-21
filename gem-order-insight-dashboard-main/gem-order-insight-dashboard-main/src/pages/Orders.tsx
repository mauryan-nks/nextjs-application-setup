
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { mockData } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/DateRangePicker";
import { SearchableSelect } from "@/components/SearchableSelect";
import { DateRange } from "@/types/filters";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { OrdersTable } from "@/components/OrdersTable";
import { useToast } from "@/hooks/use-toast";

const Orders = () => {
  const { toast } = useToast();
  const [filters, setFilters] = useState<{
    status: string;
    paymentStatus: string;
    minOrderAmount: number;
    maxOrderAmount: number;
    dateRange: DateRange;
  }>({
    status: "",
    paymentStatus: "",
    minOrderAmount: 0,
    maxOrderAmount: 0,
    dateRange: { from: undefined, to: undefined }
  });
  const [showFilters, setShowFilters] = useState(false);

  // Filter data based on selected filters
  const filteredOrders = mockData.orders.filter(order => {
    // Status filter - using status instead of orderStatus
    if (filters.status && order.status !== filters.status) {
      return false;
    }
    
    // Payment status filter - we don't have this property in the mockData.orders
    // For now, we'll just skip this filter
    
    // Order amount filter - using totalPrice instead of orderValue
    if (filters.minOrderAmount > 0 && order.totalPrice < filters.minOrderAmount) {
      return false;
    }
    
    if (filters.maxOrderAmount > 0 && order.totalPrice > filters.maxOrderAmount) {
      return false;
    }
    
    // Date range filter - Fixed by checking if from and to are Date objects
    if (filters.dateRange.from instanceof Date && 
        filters.dateRange.to instanceof Date) {
      const orderDate = new Date(order.orderDate);
      if (orderDate < filters.dateRange.from || orderDate > filters.dateRange.to) {
        return false;
      }
    }
    
    return true;
  });

  // Extract unique values for filters
  const uniqueStatuses = [...new Set(mockData.orders.map(order => order.status))];
  // Since we don't have paymentStatus in mockData.orders, let's create a sample
  const uniquePaymentStatuses = ["Paid", "Pending", "Failed"];

  const resetFilters = () => {
    setFilters({
      status: "",
      paymentStatus: "",
      minOrderAmount: 0,
      maxOrderAmount: 0,
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
        <h1 className="text-3xl font-bold mb-6">Orders</h1>
        
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex justify-between items-center">
              <span>Filter Orders</span>
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
                  disabled={!filters.status && !filters.paymentStatus && filters.minOrderAmount === 0 && filters.maxOrderAmount === 0 && !filters.dateRange.from && !filters.dateRange.to}
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
                    <label className="text-sm text-gray-500 mb-1 block">Order Status</label>
                    <SearchableSelect 
                      options={uniqueStatuses}
                      placeholder="Select Status"
                      value={filters.status}
                      onChange={(value) => setFilters({...filters, status: value})}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Payment Status</label>
                    <SearchableSelect 
                      options={uniquePaymentStatuses}
                      placeholder="Select Payment Status"
                      value={filters.paymentStatus}
                      onChange={(value) => setFilters({...filters, paymentStatus: value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm text-gray-500 mb-1 block">Min Amount</label>
                      <input 
                        type="number" 
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="Min"
                        value={filters.minOrderAmount || ""}
                        onChange={(e) => setFilters({...filters, minOrderAmount: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 mb-1 block">Max Amount</label>
                      <input 
                        type="number" 
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="Max"
                        value={filters.maxOrderAmount || ""}
                        onChange={(e) => setFilters({...filters, maxOrderAmount: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Orders List</CardTitle>
          </CardHeader>
          <CardContent>
            <OrdersTable orders={filteredOrders} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Orders;
