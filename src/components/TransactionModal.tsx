import React, { useState, useEffect } from 'react';
import { Category, Transaction } from '../types';
import { api } from '../utils/api';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction | null; // For editing
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  transaction
}) => {
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: 0,
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: ''
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const isEditing = !!transaction;

  // Update form data when transaction prop changes
  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        amount: parseFloat(transaction.amount.toString()),
        category: transaction.category,
        description: transaction.description || '',
        date: transaction.transaction_date,
        paymentMethod: transaction.payment_method || ''
      });
    } else {
      setFormData({
        type: 'expense',
        amount: 0,
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: ''
      });
    }
  }, [transaction, isOpen]);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      const categoriesData = await api.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Filter categories based on transaction type
  const filteredCategories = categories.filter(category => {
    if (formData.type === 'income') {
      return ['Salary', 'Freelance', 'Investment'].includes(category.name) || category.type === 'income';
    } else {
      return !['Salary', 'Freelance', 'Investment'].includes(category.name) || category.type === 'expense';
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('TransactionModal: Form submitted', formData);
    
    if (!formData.amount || formData.amount <= 0) {
      alert('Amount must be greater than 0');
      return;
    }
    
    if (!formData.category) {
      alert('Category is required');
      return;
    }
    
    if (!formData.date) {
      alert('Date is required');
      return;
    }
    
    if (!formData.paymentMethod) {
      alert('Payment method is required');
      return;
    }

    setLoading(true);
    try {
      const transactionData = {
        type: formData.type,
        amount: parseFloat(formData.amount.toString()),
        category: formData.category,
        description: formData.description,
        transaction_date: formData.date,
        payment_method: formData.paymentMethod
      };

      console.log('TransactionModal: Sending data to API', transactionData);

      if (isEditing && transaction) {
        console.log('TransactionModal: Updating transaction', transaction.id);
        await api.updateTransaction(transaction.id, transactionData);
      } else {
        console.log('TransactionModal: Creating new transaction');
        await api.createTransaction(transactionData);
      }
      
      console.log('TransactionModal: API call successful');
      
      // Reset form
      setFormData({
        type: 'expense',
        amount: 0,
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: ''
      });
      
      // Refresh all related components
      console.log('TransactionModal: Calling refresh functions');
      if ((window as any).refreshTransactions) {
        (window as any).refreshTransactions();
      } else {
        console.warn('TransactionModal: refreshTransactions function not found');
      }
      if ((window as any).refreshDashboard) {
        (window as any).refreshDashboard();
      } else {
        console.warn('TransactionModal: refreshDashboard function not found');
      }
      if ((window as any).refreshBudgets) {
        (window as any).refreshBudgets();
      } else {
        console.warn('TransactionModal: refreshBudgets function not found');
      }
      
      console.log('TransactionModal: Closing modal');
      onClose();
    } catch (error) {
      console.error('TransactionModal: Error saving transaction:', error);
      alert(`Failed to save transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      type: 'expense',
      amount: 0,
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: ''
    });
    onClose();
  };

  console.log('TransactionModal render: isOpen:', isOpen, 'transaction:', transaction);
  
  if (!isOpen) return null;

  return (
    <div className="modal active" id="transactionModal">
      <div className="modal-content">
        <div className="modal-header">
          <h3 id="modalTitle">{isEditing ? 'Edit Transaction' : 'Add Transaction'}</h3>
          <button className="modal-close" id="closeModal" onClick={handleCancel}>&times;</button>
        </div>
        <div className="modal-body">
          <form id="transactionForm" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Transaction Type</label>
              <div className="transaction-type-toggle">
                <input 
                  type="radio" 
                  id="expenseType" 
                  name="type" 
                  value="expense" 
                  checked={formData.type === 'expense'}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                />
                <label htmlFor="expenseType" className="expense-label">Expense</label>
                <input 
                  type="radio" 
                  id="incomeType" 
                  name="type" 
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                />
                <label htmlFor="incomeType" className="income-label">Income</label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Amount</label>
              <input 
                type="number" 
                className="form-control"
                id="amount" 
                placeholder="0.00" 
                step="0.01"
                value={formData.amount || ''}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                required 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                className="form-control"
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                required
              >
                <option value="">Select a category</option>
                {filteredCategories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Description</label>
              <input 
                type="text" 
                className="form-control" 
                id="description" 
                placeholder="Enter description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Date</label>
              <input 
                type="date" 
                className="form-control"
                id="date" 
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select 
                className="form-control"
                id="paymentMethod"
                value={formData.paymentMethod}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                required
              >
                <option value="">Select payment method</option>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="PayPal">PayPal</option>
                <option value="Auto-pay">Auto-pay</option>
                <option value="Check">Check</option>
              </select>
            </div>
            
            <div className="modal-actions">
              <button type="button" className="btn btn--outline" id="cancelBtn" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" className="btn btn--primary" id="saveTransactionBtn" disabled={loading}>
                {loading ? 'Saving...' : 'Save Transaction'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};