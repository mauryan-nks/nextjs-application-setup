
import { Contract } from "@/types/contract";
import { UserTransaction } from "@/types/user";

// Get seller name from contract, handles both string and object formats
export const getSellerName = (seller: Contract['seller']): string => {
  if (typeof seller === 'string') {
    return seller;
  }
  return seller.sellerName;
};

// Get seller email from contract
export const getSellerEmail = (seller: Contract['seller']): string => {
  if (typeof seller === 'string') {
    return ""; // Default value for string sellers
  }
  return seller.sellerEmail;
};

// Get seller address from contract
export const getSellerAddress = (seller: Contract['seller']): string => {
  if (typeof seller === 'string') {
    return ""; // Default value for string sellers
  }
  return seller.sellerAddress;
};

// Get seller GST number from contract
export const getSellerGSTNumber = (seller: Contract['seller']): string => {
  if (typeof seller === 'string') {
    return ""; // Default value for string sellers
  }
  return seller.sellerGSTNumber;
};

// Get seller verification status from contract
export const getSellerVerifiedStatus = (seller: Contract['seller']): string => {
  if (typeof seller === 'string') {
    return "Unverified"; // Default value for string sellers
  }
  return seller.sellerVerifiedStatus;
};

// Search seller data (name, email, address, etc) for a term
export const searchSellerData = (seller: Contract['seller'], term: string): boolean => {
  const lowerTerm = term.toLowerCase();
  
  if (typeof seller === 'string') {
    return seller.toLowerCase().includes(lowerTerm);
  }

  return (
    seller.sellerName.toLowerCase().includes(lowerTerm) ||
    seller.sellerEmail.toLowerCase().includes(lowerTerm) ||
    seller.sellerAddress.toLowerCase().includes(lowerTerm) ||
    seller.sellerGSTNumber.toLowerCase().includes(lowerTerm)
  );
};

// Compare seller data for sorting
export const compareSellerProperty = (
  a: Contract['seller'], 
  b: Contract['seller'], 
  property: string
): number => {
  // Handle string seller names
  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b);
  }
  
  // Handle mixed types (unlikely but handle anyway)
  if (typeof a === 'string') {
    return -1;
  }
  if (typeof b === 'string') {
    return 1;
  }
  
  // Handle objects
  const propA = a[property as keyof typeof a] || '';
  const propB = b[property as keyof typeof b] || '';
  
  return propA.localeCompare(propB);
};

// Format currency to INR
export const formatCurrencyINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR',
    maximumFractionDigits: 2 
  }).format(amount);
};

// Calculate balance amount
export const calculateBalanceAmount = (totalAmount: number, receivedAmount: number): number => {
  return Math.max(0, totalAmount - receivedAmount);
};

// Get payment status based on balance
export const getPaymentStatus = (transaction: UserTransaction): string => {
  if (transaction.status === 'failed') return 'Failed';
  if (transaction.status === 'pending') return 'Pending';
  
  const hasBalance = (transaction.balanceAmount || 0) > 0;
  if (hasBalance) return 'Partial';
  return 'Complete';
};
