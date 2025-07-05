import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import { api } from '../utils/api';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: TransactionFormData) => void;
  defaultType?: 'income' | 'expense';
}

interface TransactionFormData {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  transaction_date: string;
  description: string;
  payment_method: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultType = 'expense'
}) => {
  const [formData, setFormData] = useState<TransactionFormData>({
    type: defaultType,
    amount: 0,
    category: '',
    transaction_date: new Date().toISOString().split('T')[0],
    description: '',
    payment_method: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof TransactionFormData, string>>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

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

  const paymentMethods = [
    'Cash',
    'Credit Card',
    'Debit Card',
    'Bank Transfer',
    'PayPal',
    'Venmo',
    'Check',
    'Other'
  ];

  // Filter categories based on transaction type
  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  const handleInputChange = (field: keyof TransactionFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }

    // Clear category when type changes
    if (field === 'type') {
      setFormData(prev => ({
        ...prev,
        category: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TransactionFormData, string>> = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.transaction_date) {
      newErrors.transaction_date = 'Date is required';
    }
    
    if (!formData.payment_method) {
      newErrors.payment_method = 'Payment method is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      try {
        await api.createTransaction(formData);
        
        // Reset form
        setFormData({
          type: defaultType,
          amount: 0,
          category: '',
          transaction_date: new Date().toISOString().split('T')[0],
          description: '',
          payment_method: ''
        });
        setErrors({});
        
        // Refresh transactions list
        if ((window as any).refreshTransactions) {
          (window as any).refreshTransactions();
        }
        
        onClose();
      } catch (error) {
        console.error('Error creating transaction:', error);
        alert('Failed to create transaction. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      type: defaultType,
      amount: 0,
      category: '',
      transaction_date: new Date().toISOString().split('T')[0],
      description: '',
      payment_method: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal" id="transactionModal" style={{ display: 'flex' }}>
      <div className="modal-content">
        <div className="modal-header">
          <h3 id="modalTitle">Add Transaction</h3>
          <button className="modal-close" onClick={handleCancel}>&times;</button>
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
                  onChange={(e) => handleInputChange('type', e.target.value as 'expense')}
                />
                <label htmlFor="expenseType" className="expense-label">Expense</label>
                <input 
                  type="radio" 
                  id="incomeType" 
                  name="type" 
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={(e) => handleInputChange('type', e.target.value as 'income')}
                />
                <label htmlFor="incomeType" className="income-label">Income</label>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Amount</label>
              <input 
                type="number" 
                className={`form-control ${errors.amount ? 'error' : ''}`}
                id="amount" 
                placeholder="0.00" 
                step="0.01" 
                value={formData.amount || ''}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value))}
                required 
              />
              {errors.amount && <span className="error-text">{errors.amount}</span>}
            </div>
            
            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                className={`form-control ${errors.category ? 'error' : ''}`}
                id="category" 
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                required
              >
                <option value="">Select a category</option>
                {filteredCategories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
              {errors.category && <span className="error-text">{errors.category}</span>}
            </div>
            
            <div className="form-group">
              <label className="form-label">Date</label>
              <input 
                type="date" 
                className={`form-control ${errors.transaction_date ? 'error' : ''}`}
                id="date" 
                value={formData.transaction_date}
                onChange={(e) => handleInputChange('transaction_date', e.target.value)}
                required 
              />
              {errors.transaction_date && <span className="error-text">{errors.transaction_date}</span>}
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
              <label className="form-label">Payment Method</label>
              <select 
                className={`form-control ${errors.payment_method ? 'error' : ''}`}
                id="paymentMethod" 
                value={formData.payment_method}
                onChange={(e) => handleInputChange('payment_method', e.target.value)}
                required
              >
                <option value="">Select payment method</option>
                {paymentMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
              {errors.payment_method && <span className="error-text">{errors.payment_method}</span>}
            </div>
            
            <div className="modal-actions">
              <button type="button" className="btn btn--outline" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" className="btn btn--primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Transaction'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};