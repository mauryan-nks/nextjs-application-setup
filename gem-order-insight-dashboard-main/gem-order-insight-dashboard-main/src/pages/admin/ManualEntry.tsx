
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Save, SaveOff, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Contract } from "@/types/contract";

const contractSchema = z.object({
  contractNumber: z.string().min(1, "Contract number is required"),
  contractStatus: z.string().min(1, "Contract status is required"),
  contractDate: z.date({ required_error: "Contract date is required" }),
  procurementType: z.string().min(1, "Procurement type is required"),
  bidNumber: z.string().optional(),
  contractValue: z.number().min(0, "Contract value must be positive"),
  buyerName: z.string().min(1, "Buyer name is required"),
  buyerEmail: z.string().email("Valid email is required"),
  buyerContactNumber: z.string().min(1, "Contact number is required"),
  buyerAddress: z.string().min(1, "Address is required"),
  organizationName: z.string().min(1, "Organization name is required"),
  ministry: z.string().optional(),
  department: z.string().optional(),
  sellerName: z.string().min(1, "Seller name is required"),
  sellerEmail: z.string().email("Valid email is required"),
  sellerContactNumber: z.string().min(1, "Contact number is required"),
  sellerAddress: z.string().min(1, "Address is required"),
  sellerGSTNumber: z.string().min(1, "GST number is required"),
  sellerVerifiedStatus: z.string().min(1, "Verification status is required"),
  consigneeName: z.string().min(1, "Consignee name is required"),
  consigneeEmail: z.string().email("Valid email is required"),
  consigneeContactNumber: z.string().min(1, "Contact number is required"),
  consigneeAddress: z.string().min(1, "Address is required"),
  brand: z.string().min(1, "Brand name is required"),
  productName: z.string().min(1, "Product name is required"),
  productModel: z.string().min(1, "Product model is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be positive"),
  totalOrderValue: z.number().min(0, "Total order value must be positive"),
  categoryName: z.string().min(1, "Category name is required"),
  catalogueStatus: z.string().min(1, "Catalogue status is required"),
});

type FormData = z.infer<typeof contractSchema>;

const steps = [
  { id: 1, title: "Contract Information", description: "Basic contract details" },
  { id: 2, title: "Buyer Details", description: "Purchasing organization information" },
  { id: 3, title: "Seller Details", description: "Vendor information" },
  { id: 4, title: "Consignee Details", description: "Delivery recipient information" },
  { id: 5, title: "Product Details", description: "Order and product information" },
];

export default function ManualEntry() {
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      contractValue: 0,
      quantity: 1,
      unitPrice: 0,
      totalOrderValue: 0,
    },
  });

  const { watch, setValue } = form;
  const procurementType = watch("procurementType");
  const quantity = watch("quantity");
  const unitPrice = watch("unitPrice");

  // Auto-calculate total order value
  useEffect(() => {
    const total = quantity * unitPrice;
    setValue("totalOrderValue", total);
  }, [quantity, unitPrice, setValue]);

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data);
    toast({
      title: "Contract Saved",
      description: "The contract has been successfully saved to the system.",
    });
  };

  const saveAsDraft = () => {
    const currentData = form.getValues();
    console.log("Saved as draft:", currentData);
    toast({
      title: "Draft Saved",
      description: "Your progress has been saved as a draft.",
    });
  };

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getFieldsForStep = (step: number): (keyof FormData)[] => {
    switch (step) {
      case 1:
        return ["contractNumber", "contractStatus", "contractDate", "procurementType", "contractValue"];
      case 2:
        return ["buyerName", "buyerEmail", "buyerContactNumber", "buyerAddress", "organizationName"];
      case 3:
        return ["sellerName", "sellerEmail", "sellerContactNumber", "sellerAddress", "sellerGSTNumber", "sellerVerifiedStatus"];
      case 4:
        return ["consigneeName", "consigneeEmail", "consigneeContactNumber", "consigneeAddress"];
      case 5:
        return ["brand", "productName", "productModel", "quantity", "unitPrice", "categoryName", "catalogueStatus"];
      default:
        return [];
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="contractNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter contract number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contractStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract Status *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contractDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Contract Date *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="procurementType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Procurement Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select procurement type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="direct">Direct Order</SelectItem>
                      <SelectItem value="bid">Bid Order</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {procurementType === "bid" && (
              <FormField
                control={form.control}
                name="bidNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bid Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter bid number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="contractValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract Value *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter contract value"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="buyerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Buyer Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter buyer name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="buyerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Buyer Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter buyer email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="buyerContactNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Buyer Contact Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter contact number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="buyerAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Buyer Address *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter complete address including city, state, pin code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="organizationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter organization name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ministry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ministry Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter ministry name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter department name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="sellerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seller Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter seller name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sellerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seller Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter seller email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sellerContactNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seller Contact Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter contact number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sellerAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seller Address *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter seller address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sellerGSTNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GST Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter GST number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sellerVerifiedStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seller Verification Status *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select verification status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="OEM Verified">OEM Verified</SelectItem>
                      <SelectItem value="Reseller">Reseller</SelectItem>
                      <SelectItem value="Not Verified">Not Verified</SelectItem>
                      <SelectItem value="OEM">OEM</SelectItem>
                      <SelectItem value="NA">NA</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="consigneeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Consignee Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter consignee name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="consigneeEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Consignee Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter consignee email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="consigneeContactNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Consignee Contact Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter contact number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="consigneeAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Consignee Address *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter consignee address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter brand name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="productName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="productModel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Model *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product model" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter quantity"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Price *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter unit price"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="totalOrderValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Order Value *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Auto-calculated"
                      {...field}
                      readOnly
                      className="bg-gray-50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="catalogueStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catalogue Status *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select catalogue status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Verified">Verified</SelectItem>
                      <SelectItem value="Not Verified">Not Verified</SelectItem>
                      <SelectItem value="NA">NA</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Manual Contract Entry</h1>
          <p className="text-muted-foreground">
            Enter contract details manually for any missed entries during data upload
          </p>
        </div>

        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>New Contract Entry</CardTitle>
            <CardDescription>
              Complete all steps to add a new contract to the system
            </CardDescription>
            
            {/* Progress indicator */}
            <div className="flex items-center justify-between mt-6">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                      currentStep === step.id
                        ? "bg-primary text-primary-foreground"
                        : currentStep > step.id
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {currentStep > step.id ? "✓" : step.id}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "w-12 h-0.5 mx-2",
                        currentStep > step.id ? "bg-green-500" : "bg-muted"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-center mt-4">
              <h3 className="font-semibold">{steps[currentStep - 1].title}</h3>
              <p className="text-sm text-muted-foreground">
                {steps[currentStep - 1].description}
              </p>
            </div>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {renderStepContent()}

                <div className="flex items-center justify-between pt-6 border-t">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={saveAsDraft}
                      className="flex items-center gap-2"
                    >
                      <SaveOff className="h-4 w-4" />
                      Save as Draft
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    {currentStep > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        className="flex items-center gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                    )}

                    {currentStep < steps.length ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="flex items-center gap-2"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Submit Contract
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
