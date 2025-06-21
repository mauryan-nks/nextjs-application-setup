
// Import the DateRange type from react-day-picker
import { DateRange as DayPickerDateRange } from "react-day-picker";

// Define our DateRange type strictly
export type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

export interface Filter {
  dateRange: DateRange;
  contractStatus: string[];
  procurementType: string[];
  catalogueStatus: string[];
  sellerVerification: string[];
}
