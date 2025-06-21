
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ContractsTable } from "@/components/ContractsTable";
import { mockData } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/DateRangePicker";
import { FilterBar } from "@/components/FilterBar";
import { Search, ArrowDown, ArrowUp, FileText, Filter as FilterIcon } from "lucide-react";
import { DateRange, Filter } from "@/types/filters";
import { useToast } from "@/components/ui/use-toast";

const Contracts = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [filters, setFilters] = useState<Filter>({
    dateRange: { from: undefined, to: undefined },
    contractStatus: [],
    procurementType: [],
    catalogueStatus: [],
    sellerVerification: [],
  });

  // Filter contracts based on search term, date range, and filters
  const filteredContracts = mockData.contracts.filter(contract => {
    // Search filter
    if (searchTerm && 
        !contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !contract.buyer.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !contract.seller.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !contract.product.productName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Contract status filter
    if (filters.contractStatus.length > 0 && !filters.contractStatus.includes(contract.contractStatus)) {
      return false;
    }
    
    // Procurement type filter
    if (filters.procurementType.length > 0 && !filters.procurementType.includes(contract.procurementType)) {
      return false;
    }
    
    // Catalogue status filter
    if (filters.catalogueStatus.length > 0 && !filters.catalogueStatus.includes(contract.product.catalogueStatus)) {
      return false;
    }
    
    // Seller verification filter
    if (filters.sellerVerification.length > 0 && !filters.sellerVerification.includes(contract.seller.sellerVerifiedStatus)) {
      return false;
    }
    
    // Date range filter
    if (dateRange.from && dateRange.to) {
      const contractDate = new Date(contract.contractDate);
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      if (contractDate < fromDate || contractDate > toDate) {
        return false;
      }
    }
    
    return true;
  });

  const handleExportExcel = () => {
    toast({
      title: "Export Started",
      description: "Exporting contracts data to Excel..."
    });
    // In a real app, this would initiate an Excel export
  };

  const handleExportPDF = () => {
    toast({
      title: "Export Started",
      description: "Exporting contracts data to PDF..."
    });
    // In a real app, this would initiate a PDF export
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Contract Management</h1>
            <p className="text-lg text-gray-600">Comprehensive contract oversight and analysis</p>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 border-green-200 hover:bg-green-50 text-green-700 font-medium"
              onClick={handleExportExcel}
            >
              <ArrowDown className="h-4 w-4" />
              Export Excel
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 border-red-200 hover:bg-red-50 text-red-700 font-medium"
              onClick={handleExportPDF}
            >
              <ArrowUp className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold flex items-center text-gray-800">
              <FilterIcon className="h-5 w-5 mr-3 text-blue-600" />
              Search & Filter Contracts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by Contract ID, Buyer, Seller or Product"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="md:w-80">
                <DateRangePicker
                  onChange={(range) => setDateRange(range)}
                  value={dateRange}
                />
              </div>
            </div>
            <FilterBar filters={filters} setFilters={setFilters} />
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
              <FileText className="h-6 w-6 mr-3 text-blue-600" />
              Contracts Overview ({filteredContracts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ContractsTable data={filteredContracts} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Contracts;
