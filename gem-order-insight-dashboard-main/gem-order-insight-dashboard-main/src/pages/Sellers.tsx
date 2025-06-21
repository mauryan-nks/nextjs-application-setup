
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { mockData } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X, ChevronDown, ChevronRight, ArrowUp, ArrowDown } from "lucide-react";
import { DateRange } from "@/types/filters";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Contract } from "@/types/contract";

// Helper function to get seller name from contract
const getSellerName = (seller: Contract['seller']): string => {
  if (typeof seller === 'string') {
    return seller;
  }
  return seller.sellerName;
}

// Seller filter interface
interface SellerFilters {
  sellerName: string;
  productName: string;
  brandName: string;
  minAmount: number;
  maxAmount: number;
  dateRange: DateRange;
  searchTerm: string;
}

type SortField = "name" | "totalOrders" | "totalValue" | "latestOrder";
type SortDirection = "asc" | "desc";

const Sellers = () => {
  const { toast } = useToast();
  const [filters, setFilters] = useState<SellerFilters>({
    sellerName: "",
    productName: "",
    brandName: "",
    minAmount: 0,
    maxAmount: 0,
    dateRange: { from: undefined, to: undefined },
    searchTerm: ""
  });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedSeller, setExpandedSeller] = useState<string | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("totalValue");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Get unique sellers from both orders and contracts data
  const uniqueSellers = [...new Set([
    ...mockData.orders.map(order => order.seller),
    ...mockData.contracts.map(contract => getSellerName(contract.seller || ""))
  ])].filter(seller => seller); // Filter out empty seller names
  
  const uniqueProducts = [...new Set(mockData.orders.map(order => order.product))];
  const uniqueBrands = [...new Set(mockData.orders.map(order => order.oem))];

  // Get all contracts for a specific seller directly
  const getSellerContracts = (sellerName: string) => {
    return mockData.contracts.filter(contract => 
      getSellerName(contract.seller || "") === sellerName
    );
  };
  
  // Filter contracts based on criteria
  const filteredContracts = mockData.contracts.filter(contract => {
    const sellerName = getSellerName(contract.seller || "");
    
    // Text search
    if (filters.searchTerm && 
        !sellerName.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
        !contract.contractNumber.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
        !contract.brand.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false;
    }
    
    // Seller filter
    if (filters.sellerName && sellerName !== filters.sellerName) {
      return false;
    }
    
    // Brand/OEM filter
    if (filters.brandName && contract.brand !== filters.brandName) {
      return false;
    }
    
    // Amount filter
    if (filters.minAmount > 0 && contract.contractValue < filters.minAmount) {
      return false;
    }
    
    if (filters.maxAmount > 0 && contract.contractValue > filters.maxAmount) {
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

  // Group contracts by seller for summary view
  const sellerSummary = filteredContracts.reduce((acc, contract) => {
    const sellerName = getSellerName(contract.seller || "Unknown");
    
    if (!acc[sellerName]) {
      acc[sellerName] = {
        name: sellerName,
        totalContracts: 0,
        totalValue: 0,
        products: new Set<string>(),
        brands: new Set<string>(),
        latestContract: null,
        contracts: [],
      };
    }
    
    acc[sellerName].totalContracts += 1;
    acc[sellerName].totalValue += contract.contractValue;
    acc[sellerName].brands.add(contract.brand);
    acc[sellerName].contracts.push(contract);
    
    const contractDate = new Date(contract.contractDate);
    if (!acc[sellerName].latestContract || contractDate > new Date(acc[sellerName].latestContract)) {
      acc[sellerName].latestContract = contract.contractDate;
    }
    
    // Find related products from orders that match this contract
    const relatedOrders = mockData.orders.filter(order => 
      order.seller === sellerName && order.orderId === contract.contractNumber
    );
    
    relatedOrders.forEach(order => {
      acc[sellerName].products.add(order.product);
    });
    
    return acc;
  }, {} as Record<string, {
    name: string;
    totalContracts: number;
    totalValue: number;
    products: Set<string>;
    brands: Set<string>;
    latestContract: string | null;
    contracts: typeof mockData.contracts;
  }>);

  let sellerSummaryArray = Object.values(sellerSummary);
  
  // Apply sorting
  sellerSummaryArray = sellerSummaryArray.sort((a, b) => {
    if (sortField === "name") {
      return sortDirection === "asc" 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    }
    
    if (sortField === "totalOrders") {
      return sortDirection === "asc" 
        ? a.totalContracts - b.totalContracts 
        : b.totalContracts - a.totalContracts;
    }
    
    if (sortField === "totalValue") {
      return sortDirection === "asc" 
        ? a.totalValue - b.totalValue 
        : b.totalValue - a.totalValue;
    }
    
    if (sortField === "latestOrder") {
      if (!a.latestContract) return sortDirection === "asc" ? -1 : 1;
      if (!b.latestContract) return sortDirection === "asc" ? 1 : -1;
      
      return sortDirection === "asc"
        ? new Date(a.latestContract).getTime() - new Date(b.latestContract).getTime()
        : new Date(b.latestContract).getTime() - new Date(a.latestContract).getTime();
    }
    
    return 0;
  });

  // Get orders for a specific seller
  const getSellerOrders = (sellerName: string) => {
    return mockData.orders.filter(order => order.seller === sellerName);
  };

  const resetFilters = () => {
    setFilters({
      sellerName: "",
      productName: "",
      brandName: "",
      minAmount: 0,
      maxAmount: 0,
      dateRange: { from: undefined, to: undefined },
      searchTerm: ""
    });
    
    toast({
      title: "Filters Reset",
      description: "All filters have been cleared."
    });
  };

  const toggleSellerDetails = (sellerName: string) => {
    if (expandedSeller === sellerName) {
      setExpandedSeller(null);
    } else {
      setExpandedSeller(sellerName);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    
    toast({
      title: "Results Sorted",
      description: `Sorted by ${field} in ${sortDirection === "asc" ? "ascending" : "descending"} order`
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

  useEffect(() => {
    // Show the user how many sellers match their filters
    if (Object.values(filters).some(val => val !== "" && val !== 0 && val?.from !== undefined)) {
      toast({
        title: "Filter Applied",
        description: `Found ${sellerSummaryArray.length} sellers matching your criteria`
      });
    }
  }, [filters]);

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Seller Management</h1>
            <p className="text-lg text-gray-600">Comprehensive seller performance and contract overview</p>
          </div>
        </div>
        
        <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold flex justify-between items-center text-gray-800">
              <span>Advanced Search & Filters</span>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 px-4 border-blue-200 hover:bg-blue-50"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 px-4 border-red-200 hover:bg-red-50"
                  onClick={resetFilters}
                  disabled={!filters.sellerName && !filters.productName && !filters.brandName && 
                           filters.minAmount === 0 && filters.maxAmount === 0 && 
                           !filters.dateRange.from && !filters.searchTerm}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by seller, product, or contract number"
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                  className="pl-10 h-11 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="md:w-80">
                <DateRangePicker
                  onChange={handleDateRangeChange}
                  value={filters.dateRange}
                />
              </div>
            </div>
            
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-blue-100">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Seller Name</label>
                  <Select 
                    value={filters.sellerName} 
                    onValueChange={(value) => setFilters({...filters, sellerName: value})}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select Seller" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Sellers</SelectItem>
                      {uniqueSellers.map((seller) => (
                        <SelectItem key={seller} value={seller}>
                          {seller}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Brand</label>
                  <Select 
                    value={filters.brandName} 
                    onValueChange={(value) => setFilters({...filters, brandName: value})}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select Brand" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Brands</SelectItem>
                      {uniqueBrands.map(brand => (
                        <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Min Amount (₹)</label>
                    <input 
                      type="number" 
                      className="w-full rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      placeholder="Min"
                      value={filters.minAmount || ""}
                      onChange={(e) => setFilters({...filters, minAmount: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Max Amount (₹)</label>
                    <input 
                      type="number" 
                      className="w-full rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      placeholder="Max"
                      value={filters.maxAmount || ""}
                      onChange={(e) => setFilters({...filters, maxAmount: Number(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Seller Performance Overview ({sellerSummaryArray.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="w-12"></TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-100 transition-colors font-semibold"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center">
                        Seller Name
                        {sortField === "name" && (
                          sortDirection === "asc" 
                            ? <ArrowUp className="ml-2 h-4 w-4 text-blue-600" /> 
                            : <ArrowDown className="ml-2 h-4 w-4 text-blue-600" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-100 transition-colors font-semibold"
                      onClick={() => handleSort("totalOrders")}
                    >
                      <div className="flex items-center">
                        Total Contracts
                        {sortField === "totalOrders" && (
                          sortDirection === "asc" 
                            ? <ArrowUp className="ml-2 h-4 w-4 text-blue-600" /> 
                            : <ArrowDown className="ml-2 h-4 w-4 text-blue-600" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-100 transition-colors font-semibold"
                      onClick={() => handleSort("totalValue")}
                    >
                      <div className="flex items-center">
                        Contract Value
                        {sortField === "totalValue" && (
                          sortDirection === "asc" 
                            ? <ArrowUp className="ml-2 h-4 w-4 text-blue-600" /> 
                            : <ArrowDown className="ml-2 h-4 w-4 text-blue-600" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold">Products</TableHead>
                    <TableHead className="font-semibold">Brands</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-100 transition-colors font-semibold"
                      onClick={() => handleSort("latestOrder")}
                    >
                      <div className="flex items-center">
                        Latest Contract
                        {sortField === "latestOrder" && (
                          sortDirection === "asc" 
                            ? <ArrowUp className="ml-2 h-4 w-4 text-blue-600" /> 
                            : <ArrowDown className="ml-2 h-4 w-4 text-blue-600" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold">Performance</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sellerSummaryArray.length > 0 ? (
                    sellerSummaryArray.map((seller, index) => (
                      <>
                        <TableRow key={index} className="hover:bg-blue-50/50 group transition-colors">
                          <TableCell className="w-4 px-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => toggleSellerDetails(seller.name)}
                            >
                              {expandedSeller === seller.name ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="font-semibold text-gray-900">{seller.name}</TableCell>
                          <TableCell className="font-medium">{seller.totalContracts}</TableCell>
                          <TableCell className="font-semibold text-green-700">₹{seller.totalValue.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {Array.from(seller.products).slice(0, 2).map((product) => (
                                <span key={product} className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-1 font-medium">
                                  {product}
                                </span>
                              ))}
                              {seller.products.size > 2 && (
                                <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-1 font-medium">
                                  +{seller.products.size - 2} more
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-gray-700">
                            {Array.from(seller.brands).join(", ")}
                          </TableCell>
                          <TableCell className="font-medium">
                            {seller.latestContract ? new Date(seller.latestContract).toLocaleDateString() : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              seller.totalValue > 1000000 ? "bg-green-100 text-green-800 font-semibold" :
                              seller.totalValue > 500000 ? "bg-blue-100 text-blue-800 font-semibold" :
                              "bg-yellow-100 text-yellow-800 font-semibold"
                            }>
                              {seller.totalValue > 1000000 ? "High Performer" :
                               seller.totalValue > 500000 ? "Medium Performer" : "Growing Seller"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="hover:bg-blue-50 border-blue-200"
                                  onClick={() => setSelectedSeller(seller.name)}
                                >
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader className="border-b pb-4">
                                  <DialogTitle className="text-2xl font-bold text-gray-800">
                                    Seller Details: {seller.name}
                                  </DialogTitle>
                                  <DialogDescription className="text-lg text-gray-600">
                                    Comprehensive view of contracts, orders, and performance metrics
                                  </DialogDescription>
                                </DialogHeader>
                                <Tabs defaultValue="contracts" className="mt-6">
                                  <TabsList className="mb-6 bg-gray-100">
                                    <TabsTrigger value="contracts" className="font-semibold">
                                      Contracts ({seller.contracts.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="orders" className="font-semibold">
                                      Orders ({getSellerOrders(seller.name).length})
                                    </TabsTrigger>
                                    <TabsTrigger value="products" className="font-semibold">
                                      Products ({seller.products.size})
                                    </TabsTrigger>
                                  </TabsList>
                                  
                                  <TabsContent value="contracts" className="border rounded-lg p-4 bg-gray-50">
                                    <div className="max-h-96 overflow-y-auto">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead className="font-semibold">Contract Number</TableHead>
                                            <TableHead className="font-semibold">Brand</TableHead>
                                            <TableHead className="font-semibold">Value</TableHead>
                                            <TableHead className="font-semibold">Date</TableHead>
                                            <TableHead className="font-semibold">Type</TableHead>
                                            <TableHead className="font-semibold">Bid Number</TableHead>
                                            <TableHead className="font-semibold">Status</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {seller.contracts.map((contract) => (
                                            <TableRow key={contract.contractNumber} className="hover:bg-white transition-colors">
                                              <TableCell className="font-medium text-blue-600">{contract.contractNumber}</TableCell>
                                              <TableCell className="font-medium">{contract.brand}</TableCell>
                                              <TableCell className="font-semibold text-green-700">₹{contract.contractValue.toLocaleString()}</TableCell>
                                              <TableCell>{new Date(contract.contractDate).toLocaleDateString()}</TableCell>
                                              <TableCell>
                                                <Badge variant="outline" className="font-medium">
                                                  {contract.procurementType}
                                                </Badge>
                                              </TableCell>
                                              <TableCell>
                                                {contract.procurementType === "bid" && (contract as any).bidNumber ? (
                                                  <span className="text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded">
                                                    {(contract as any).bidNumber}
                                                  </span>
                                                ) : (
                                                  <span className="text-gray-400 text-sm">-</span>
                                                )}
                                              </TableCell>
                                              <TableCell>
                                                <Badge variant={
                                                  contract.contractStatus === "Active" ? "default" :
                                                  contract.contractStatus === "Completed" ? "outline" : "secondary"
                                                } className="font-medium">
                                                  {contract.contractStatus}
                                                </Badge>
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </TabsContent>
                                  
                                  <TabsContent value="orders" className="border rounded-lg p-4 bg-gray-50">
                                    <div className="max-h-96 overflow-y-auto">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead className="font-semibold">Order ID</TableHead>
                                            <TableHead className="font-semibold">Product</TableHead>
                                            <TableHead className="font-semibold">Quantity</TableHead>
                                            <TableHead className="font-semibold">Price</TableHead>
                                            <TableHead className="font-semibold">Date</TableHead>
                                            <TableHead className="font-semibold">Status</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {getSellerOrders(seller.name).map((order) => (
                                            <TableRow key={order.orderId} className="hover:bg-white transition-colors">
                                              <TableCell className="font-medium text-blue-600">{order.orderId}</TableCell>
                                              <TableCell className="font-medium">{order.product}</TableCell>
                                              <TableCell className="font-medium">{order.quantity}</TableCell>
                                              <TableCell className="font-semibold text-green-700">₹{order.totalPrice.toLocaleString()}</TableCell>
                                              <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                                              <TableCell>
                                                <Badge variant={
                                                  order.status === "Delivered" ? "default" :
                                                  order.status === "Shipped" ? "outline" : "secondary"
                                                } className="font-medium">
                                                  {order.status}
                                                </Badge>
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </TabsContent>
                                  
                                  <TabsContent value="products" className="border rounded-lg p-4 bg-gray-50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      {Array.from(seller.products).map((product) => {
                                        const productOrders = getSellerOrders(seller.name).filter(o => o.product === product);
                                        const totalQuantity = productOrders.reduce((sum, o) => sum + o.quantity, 0);
                                        const totalValue = productOrders.reduce((sum, o) => sum + o.totalPrice, 0);
                                        
                                        return (
                                          <Card key={product} className="hover:border-blue-400 hover:shadow-md cursor-pointer transition-all bg-white">
                                            <CardHeader className="py-4">
                                              <CardTitle className="text-lg font-semibold text-gray-800">{product}</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                              <dl className="grid grid-cols-2 gap-3 text-sm">
                                                <dt className="text-gray-600 font-medium">Total Orders:</dt>
                                                <dd className="font-semibold">{productOrders.length}</dd>
                                                
                                                <dt className="text-gray-600 font-medium">Total Quantity:</dt>
                                                <dd className="font-semibold">{totalQuantity}</dd>
                                                
                                                <dt className="text-gray-600 font-medium">Total Value:</dt>
                                                <dd className="font-semibold text-green-700">₹{totalValue.toLocaleString()}</dd>
                                                
                                                <dt className="text-gray-600 font-medium">Brand:</dt>
                                                <dd className="font-semibold">{productOrders[0]?.oem || "N/A"}</dd>
                                              </dl>
                                            </CardContent>
                                          </Card>
                                        );
                                      })}
                                    </div>
                                  </TabsContent>
                                </Tabs>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                        
                        {/* Expanded view for seller details */}
                        {expandedSeller === seller.name && (
                          <TableRow>
                            <TableCell colSpan={9} className="p-0">
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-t">
                                <h4 className="font-semibold text-lg mb-4 text-gray-800">Recent Contracts</h4>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="font-semibold">Contract Number</TableHead>
                                      <TableHead className="font-semibold">Brand</TableHead>
                                      <TableHead className="font-semibold">Value</TableHead>
                                      <TableHead className="font-semibold">Date</TableHead>
                                      <TableHead className="font-semibold">Type</TableHead>
                                      <TableHead className="font-semibold">Bid Number</TableHead>
                                      <TableHead className="font-semibold">Status</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {seller.contracts.slice(0, 3).map((contract) => (
                                      <TableRow key={contract.contractNumber} className="hover:bg-white/70 transition-colors">
                                        <TableCell className="font-medium text-blue-600">{contract.contractNumber}</TableCell>
                                        <TableCell className="font-medium">{contract.brand}</TableCell>
                                        <TableCell className="font-semibold text-green-700">₹{contract.contractValue.toLocaleString()}</TableCell>
                                        <TableCell>{new Date(contract.contractDate).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                          <Badge variant="outline" className="font-medium">
                                            {contract.procurementType}
                                          </Badge>
                                        </TableCell>
                                        <TableCell>
                                          {contract.procurementType === "bid" && (contract as any).bidNumber ? (
                                            <span className="text-blue-600 font-semibold bg-blue-100 px-2 py-1 rounded">
                                              {(contract as any).bidNumber}
                                            </span>
                                          ) : (
                                            <span className="text-gray-400 text-sm">-</span>
                                          )}
                                        </TableCell>
                                        <TableCell>
                                          <Badge variant={
                                            contract.contractStatus === "Active" ? "default" :
                                            contract.contractStatus === "Completed" ? "outline" : "secondary"
                                          } className="font-medium">
                                            {contract.contractStatus}
                                          </Badge>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                                {seller.contracts.length > 3 && (
                                  <div className="mt-4 text-right">
                                    <Button 
                                      variant="link" 
                                      size="sm"
                                      className="text-blue-600 hover:text-blue-800 font-medium"
                                      onClick={() => {
                                        setSelectedSeller(seller.name);
                                        document.querySelector(`[data-state="open"]`)?.dispatchEvent(
                                          new MouseEvent('click', { bubbles: true })
                                        );
                                      }}
                                    >
                                      View all {seller.contracts.length} contracts →
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12">
                        <div className="text-gray-500">
                          <div className="text-lg font-medium mb-2">No sellers found</div>
                          <div className="text-sm">Try adjusting your search criteria or filters</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Sellers;
