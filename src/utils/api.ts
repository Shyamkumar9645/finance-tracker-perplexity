import { Contact, Loan, Payment, LoanBalance, Transaction, Category } from '../types';

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
  }
};