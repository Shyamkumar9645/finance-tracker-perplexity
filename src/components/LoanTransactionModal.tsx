import React, { useState, useEffect } from 'react';
import { Borrower, LoanTransaction } from '../types';

interface LoanTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  borrowers: Borrower[];
  transaction?: LoanTransaction | null;
  defaultBorrowerId?: number;
  onSave: () => void;
}

export const LoanTransactionModal: React.FC<LoanTransactionModalProps> = ({
  isOpen,
  onClose,
  borrowers,
  transaction,
  defaultBorrowerId,
  onSave
}) => {
  const [formData, setFormData] = useState({
    borrower_id: '',
    type: 'given' as 'given' | 'received',
    amount: '',
    interest_rate: '',
    date: new Date().toISOString().split('T')[0],
    due_date: '',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (transaction) {
      // Editing existing transaction
      setFormData({
        borrower_id: transaction.borrower_id.toString(),
        type: transaction.type,
        amount: Math.abs(transaction.amount).toString(),
        interest_rate: transaction.interest_rate.toString(),
        date: transaction.transaction_date.split('T')[0],
        due_date: transaction.due_date ? transaction.due_date.split('T')[0] : '',
        description: transaction.description || ''
      });
    } else {
      // Adding new transaction
      setFormData({
        borrower_id: defaultBorrowerId ? defaultBorrowerId.toString() : '',
        type: 'given',
        amount: '',
        interest_rate: '0',
        date: new Date().toISOString().split('T')[0],
        due_date: '',
        description: ''
      });
    }
    setErrors({});
  }, [transaction, defaultBorrowerId, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.borrower_id) {
      newErrors.borrower_id = 'Please select a borrower';
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    if (formData.interest_rate && parseFloat(formData.interest_rate) < 0) {
      newErrors.interest_rate = 'Interest rate cannot be negative';
    }
    
    if (!formData.date) {
      newErrors.date = 'Please select a date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form data:', formData);
    
    if (!validateForm()) {
      console.log('Form validation failed:', errors);
      return;
    }

    setIsSubmitting(true);
    try {
      let response;
      
      if (transaction) {
        // Update existing transaction - Note: API doesn't support PUT yet, so we'll show a message
        setErrors({ submit: 'Editing transactions is not yet supported. Please delete and create a new one.' });
        setIsSubmitting(false);
        return;
      } else {
        // Create new transaction
        response = await fetch('http://localhost:3001/api/loan-transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            borrower_id: parseInt(formData.borrower_id.toString()),
            type: formData.type,
            amount: parseFloat(formData.amount),
            interest_rate: parseFloat(formData.interest_rate || '0'),
            date: formData.date,
            due_date: formData.due_date || null,
            description: formData.description || (formData.type === 'given' ? 'Money Given' : 'Money Received')
          }),
        });
      }

      if (!response || !response.ok) {
        const errorText = await response?.text();
        console.error('API Error:', errorText);
        throw new Error(`Failed to save transaction: ${errorText}`);
      }

      const result = await response.json();
      console.log('Transaction saved successfully:', result);
      
      onSave();
      onClose();
      
      // Reset form
      setFormData({
        borrower_id: '',
        type: 'given',
        amount: '',
        interest_rate: '0',
        date: new Date().toISOString().split('T')[0],
        due_date: '',
        description: ''
      });
    } catch (error) {
      console.error('Error saving transaction:', error);
      setErrors({ submit: `Failed to save transaction: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (!isOpen) {
    console.log('Modal not open, isOpen:', isOpen);
    return null;
  }
  
  console.log('Modal is open, rendering...', { isOpen, borrowers: borrowers.length });

  return (
    <div className="modal-overlay" onClick={onClose} style={{ display: 'flex', zIndex: 10000 }}>
      <div className="modal loan-transaction-modal" onClick={(e) => e.stopPropagation()} style={{ background: 'white', border: '2px solid red' }}>
        <div className="modal-header">
          <h2>{transaction ? 'Edit Transaction' : 'Add Loan Transaction'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="borrower_id">Borrower *</label>
              <select
                id="borrower_id"
                name="borrower_id"
                value={formData.borrower_id}
                onChange={handleChange}
                className={errors.borrower_id ? 'error' : ''}
                required
              >
                <option value="">Choose a borrower...</option>
                {borrowers.map(borrower => (
                  <option key={borrower.id} value={borrower.id}>
                    {borrower.name}
                  </option>
                ))}
              </select>
              {errors.borrower_id && <span className="error-text">{errors.borrower_id}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="type">Transaction Type *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="transaction-type-select"
                required
              >
                <option value="given">💸 Money Given (Loan)</option>
                <option value="received">💰 Money Received (Payment)</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount">Amount (₹) *</label>
              <div className="input-with-icon">
                <span className="input-icon">₹</span>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  className={errors.amount ? 'error' : ''}
                  placeholder="0.00"
                  required
                />
              </div>
              {errors.amount && <span className="error-text">{errors.amount}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="interest_rate">Interest Rate (% per year)</label>
              <div className="input-with-icon">
                <input
                  type="number"
                  id="interest_rate"
                  name="interest_rate"
                  value={formData.interest_rate}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className={errors.interest_rate ? 'error' : ''}
                  placeholder="12.0"
                />
                <span className="input-icon-right">%</span>
              </div>
              {errors.interest_rate && <span className="error-text">{errors.interest_rate}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Transaction Date *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={errors.date ? 'error' : ''}
                required
              />
              {errors.date && <span className="error-text">{errors.date}</span>}
            </div>

            {formData.type === 'given' && (
              <div className="form-group">
                <label htmlFor="due_date">Due Date (Optional)</label>
                <input
                  type="date"
                  id="due_date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          <div className="form-group full-width">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Enter transaction details, purpose, or notes..."
            />
          </div>

          {errors.submit && (
            <div className="form-error">
              <span className="error-icon">⚠️</span>
              {errors.submit}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Saving...
                </>
              ) : (
                <>
                  {transaction ? '✏️ Update Transaction' : '💾 Save Transaction'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};