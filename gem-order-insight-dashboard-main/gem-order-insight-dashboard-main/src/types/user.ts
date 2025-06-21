
export interface UserSalesData {
  totalSales: number;
  commissionRate: number;
  paidAmount: number;
  pendingAmount: number;
  lastPaymentDate?: string;
}

export interface UserPanelAccess {
  dashboard: boolean;
  contracts: boolean;
  analytics: boolean;
  settings: boolean;
  sellers: boolean;
}

export interface UserTransaction {
  id: string;
  date: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  status: 'pending' | 'completed' | 'failed';
  receiveAmount?: number; // Amount actually received
  balanceAmount?: number; // Balance amount
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  organization: string;
  isActive: boolean;
  createdAt: string;
  lastLogin: string | null;
  salesData: UserSalesData;
  panelAccess?: UserPanelAccess;
  brands?: string[];
  transactions?: UserTransaction[];
  initialPayment?: number;
}
