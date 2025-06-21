
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, FileText, AlertCircle } from "lucide-react";
import { DataUploadTemplate } from "@/components/DataUploadTemplate";

const DataUpload = () => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      setUploading(false);
      setSelectedFile(null);
      toast({
        title: "Upload Successful",
        description: `${selectedFile.name} has been uploaded and data has been automatically processed across all modules.`,
      });
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Unified Data Management</h1>
          <p className="text-lg text-gray-600">Streamline your data upload process with our comprehensive management system</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-t-lg">
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                <Upload className="h-6 w-6 mr-3 text-blue-600" />
                Upload Data
              </CardTitle>
              <CardDescription className="text-gray-700 text-base leading-relaxed">
                Upload a single unified data file to automatically populate contracts, orders, brands, and more.
                Our intelligent system will process and categorize all data appropriately across all modules.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-6">
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-700">
                  Choose File (Excel, CSV or JSON format)
                </label>
                <div className="border-2 border-dashed border-blue-200 rounded-lg p-8 text-center bg-white/50 hover:bg-white/70 transition-colors">
                  <input
                    type="file"
                    id="fileUpload"
                    className="hidden"
                    accept=".xlsx,.xls,.csv,.json"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="fileUpload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <div className="bg-blue-100 p-4 rounded-full mb-4">
                      <Upload className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-gray-700 mb-2 font-medium">
                      Click to select or drag and drop
                    </p>
                    <p className="text-sm text-gray-500">
                      Supported formats: .xlsx, .xls, .csv, .json
                    </p>
                  </label>
                </div>
                {selectedFile && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-green-600 mr-3" />
                      <div className="text-sm">
                        <span className="text-gray-700">Selected: </span>
                        <span className="font-semibold text-green-700">{selectedFile.name}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-amber-800">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-3 text-amber-900">Important Notes</h4>
                    <ul className="list-disc pl-5 text-sm space-y-2 leading-relaxed">
                      <li>Upload one comprehensive file with all required fields.</li>
                      <li><strong>For contracts from bids</strong>, include the <span className="font-semibold">Bid Number field</span> (Format: GEM/2025/B/6259575).</li>
                      <li><strong>Contract Numbers</strong> should follow the format: GEMC-511687770672395.</li>
                      <li>The system will automatically categorize data into appropriate modules.</li>
                      <li>Maximum file size is 10MB.</li>
                      <li>Duplicate entries will be updated, not created as new records.</li>
                      <li>Download the template first if you haven't already.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-6 bg-gray-50 rounded-b-lg">
              <Button 
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-3" />
                    Upload & Process Data
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <DataUploadTemplate />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DataUpload;
