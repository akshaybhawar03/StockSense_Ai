export type PartyType = 'CUSTOMER' | 'VENDOR';
export type BillStatus = 'PAID' | 'UNPAID' | 'PARTIAL' | 'OVERDUE';
export type PaymentMode = 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque';
export type SortBy = 'name' | 'outstanding' | 'overdue';

export interface PartySummary {
  total_outstanding: number;
  overdue_30_plus: number;
  collected_this_month: number;
}

export interface Party {
  id: string;
  name: string;
  city: string;
  type: PartyType;
  bill_count: number;
  outstanding_amount: number;
  has_overdue: boolean;
  phone?: string;
  email?: string;
}

export interface Bill {
  id: string;
  party_id: string;
  bill_number: string;
  bill_date: string;       // ISO date string
  due_date: string;        // ISO date string
  amount: number;
  paid_amount: number;
  remaining_amount: number;
  status: BillStatus;
}

export interface Payment {
  id: string;
  bill_id: string;
  amount: number;
  payment_date: string;
  mode: PaymentMode;
  reference_number?: string;
}

export interface LedgerEntry {
  id: string;
  party_id: string;
  date: string;
  description: string;
  debit: number | null;
  credit: number | null;
  balance: number;
  type: 'invoice' | 'payment';
}

export interface RecordPaymentPayload {
  amount: number;
  payment_date: string;
  mode: PaymentMode;
  reference_number?: string;
}
