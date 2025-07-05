import { Contact, Loan, Payment, LoanBalance, Transaction, Category, Budget } from '../types';

const API_BASE = 'http://localhost:3001/api';

export const api = {
  // Contacts
  getContacts: async (): Promise<Contact[]> => {
    const response = await fetch(`${API_BASE}/contacts`);
    return response.json();
  },

  createContact: async (contact: Omit<Contact, 'id' | 'created_at'>): Promise<{ id: number }> => {
    const response = await fetch(`${API_BASE}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contact)
    });
    return response.json();
  },

  // Loans
  getLoans: async (): Promise<Loan[]> => {
    const response = await fetch(`${API_BASE}/loans`);
    return response.json();
  },

  createLoan: async (loan: Omit<Loan, 'id' | 'created_at' | 'contact_name'>): Promise<{ id: number }> => {
    const response = await fetch(`${API_BASE}/loans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loan)
    });
    return response.json();
  },

  getLoanBalance: async (loanId: number): Promise<LoanBalance> => {
    const response = await fetch(`${API_BASE}/loans/${loanId}/balance`);
    return response.json();
  },

  // Payments
  getPayments: async (loanId: number): Promise<Payment[]> => {
    const response = await fetch(`${API_BASE}/payments/${loanId}`);
    return response.json();
  },

  createPayment: async (payment: Omit<Payment, 'id' | 'created_at'>): Promise<{ id: number }> => {
    const response = await fetch(`${API_BASE}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payment)
    });
    return response.json();
  },

  // Transactions
  getTransactions: async (): Promise<Transaction[]> => {
    const response = await fetch(`${API_BASE}/transactions`);
    return response.json();
  },

  createTransaction: async (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<{ id: number }> => {
    const response = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction)
    });
    return response.json();
  },

  updateTransaction: async (id: number, transaction: Partial<Omit<Transaction, 'id' | 'created_at'>>): Promise<Transaction> => {
    const response = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction)
    });
    return response.json();
  },

  deleteTransaction: async (id: number): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    const response = await fetch(`${API_BASE}/categories`);
    return response.json();
  },

  createCategory: async (category: Omit<Category, 'id' | 'created_at'>): Promise<{ id: number }> => {
    const response = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category)
    });
    return response.json();
  },

  updateCategory: async (id: number, category: Partial<Omit<Category, 'id' | 'created_at'>>): Promise<Category> => {
    const response = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category)
    });
    return response.json();
  },

  deleteCategory: async (id: number): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  },

  // Budgets
  getBudgets: async (): Promise<Budget[]> => {
    const response = await fetch(`${API_BASE}/budgets`);
    return response.json();
  },

  createBudget: async (budget: Omit<Budget, 'id' | 'created_at' | 'updated_at' | 'category_name' | 'spent' | 'remaining'>): Promise<{ id: number }> => {
    const response = await fetch(`${API_BASE}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(budget)
    });
    return response.json();
  },

  updateBudget: async (id: number, budget: Partial<Omit<Budget, 'id' | 'created_at' | 'category_name' | 'spent' | 'remaining'>>): Promise<Budget> => {
    const response = await fetch(`${API_BASE}/budgets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(budget)
    });
    return response.json();
  },

  deleteBudget: async (id: number): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_BASE}/budgets/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  },

  // Dashboard Analytics
  getDashboardSummary: async (): Promise<{
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    savingsRate: number;
    totalIncome: number;
    totalExpenses: number;
  }> => {
    const response = await fetch(`${API_BASE}/dashboard/summary`);
    return response.json();
  },

  getRecentTransactions: async (): Promise<any[]> => {
    const response = await fetch(`${API_BASE}/dashboard/recent-transactions`);
    return response.json();
  },

  getCategorySpending: async (): Promise<{
    category: string;
    total: number;
    icon: string;
    color: string;
  }[]> => {
    const response = await fetch(`${API_BASE}/dashboard/category-spending`);
    return response.json();
  },

  getBudgetProgress: async (): Promise<{
    category: string;
    icon: string;
    color: string;
    spent: number;
    budget: number;
    percentage: number;
    status: string;
  }[]> => {
    const response = await fetch(`${API_BASE}/dashboard/budget-progress`);
    return response.json();
  },

  getSpendingTrend: async (): Promise<{
    month: string;
    income: number;
    expenses: number;
    net: number;
  }[]> => {
    const response = await fetch(`${API_BASE}/dashboard/spending-trend`);
    return response.json();
  }
};