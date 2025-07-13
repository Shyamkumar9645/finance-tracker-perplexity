export interface Contact {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  created_at: string;
}

export interface Loan {
  id: number;
  contact_id: number;
  contact_name?: string;
  amount: number;
  interest_rate: number;
  interest_type: 'simple' | 'compound';
  start_date: string;
  due_date?: string;
  status: 'active' | 'paid' | 'defaulted';
  notes?: string;
  created_at: string;
}

export interface Payment {
  id: number;
  loan_id: number;
  amount: number;
  payment_date: string;
  payment_method?: string;
  notes?: string;
  created_at: string;
}

export interface LoanBalance {
  original_amount: number;
  total_owed: number;
  total_paid: number;
  balance: number;
  days_elapsed: number;
}

export interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  payment_method?: string;
  transaction_date: string;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  icon?: string;
  color?: string;
  budget_limit: number;
  type: 'income' | 'expense';
  created_at: string;
}

export interface Budget {
  id: number;
  category_id: number;
  category_name?: string;
  name: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date: string;
  status: 'active' | 'paused' | 'completed';
  notes?: string;
  created_at: string;
  updated_at?: string;
  spent?: number;
  remaining?: number;
}

export interface Borrower {
  id: number;
  name: string;
  contact?: string;
  notes?: string;
  totalLent: number;
  totalReceived: number;
  outstanding: number;
  totalInterest: number;
  transactions: LoanTransaction[];
  created_at: string;
  updated_at?: string;
}

export interface LoanTransaction {
  id: number;
  borrower_id: number;
  borrower_name?: string;
  type: 'given' | 'received';
  amount: number;
  interest_rate: number;
  transaction_date: string;
  due_date?: string;
  description?: string;
  interest_earned?: number;
  created_at: string;
  updated_at?: string;
}

export interface LoanSummary {
  totalLent: number;
  totalOutstanding: number;
  totalInterest: number;
  activeBorrowers: number;
}