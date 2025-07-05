import React, { useState, useEffect } from 'react';
import { Budget, Category } from '../types';
import { api } from '../utils/api';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (budget: BudgetFormData) => void;
  budget?: Budget | null; // For editing
}

interface BudgetFormData {
  category_id: number;
  name: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date: string;
  status: 'active' | 'paused' | 'completed';
  notes: string;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  budget
}) => {
  const [formData, setFormData] = useState<BudgetFormData>({
    category_id: 0,
    name: '',
    amount: 0,
    period: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0], // End of current year
    status: 'active',
    notes: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BudgetFormData, string>>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const isEditing = !!budget;

  // Update form data when budget prop changes
  useEffect(() => {
    if (budget) {
      setFormData({
        category_id: budget.category_id,
        name: budget.name,
        amount: budget.amount,
        period: budget.period,
        start_date: budget.start_date,
        end_date: budget.end_date,
        status: budget.status,
        notes: budget.notes || ''
      });
    } else {
      setFormData({
        category_id: 0,
        name: '',
        amount: 0,
        period: 'monthly',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
        status: 'active',
        notes: ''
      });
    }
    setErrors({});
  }, [budget, isOpen]);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      const categoriesData = await api.getCategories();
      // Filter to only expense categories for budgeting
      const expenseCategories = categoriesData.filter(cat => cat.type === 'expense');
      setCategories(expenseCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const periods = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'completed', label: 'Completed' }
  ];

  const handleInputChange = (field: keyof BudgetFormData, value: any) => {
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

    // Auto-generate budget name based on category and period
    if (field === 'category_id' || field === 'period') {
      const updatedFormData = { ...formData, [field]: value };
      if (updatedFormData.category_id && updatedFormData.period) {
        const selectedCategory = categories.find(cat => cat.id === updatedFormData.category_id);
        if (selectedCategory && !budget) { // Only auto-generate for new budgets
          setFormData(prev => ({
            ...prev,
            [field]: value,
            name: `${updatedFormData.period.charAt(0).toUpperCase() + updatedFormData.period.slice(1)} ${selectedCategory.name} Budget`
          }));
        }
      }
    }

    // Auto-adjust end date based on start date and period
    if (field === 'start_date' || field === 'period') {
      const updatedFormData = { ...formData, [field]: value };
      if (updatedFormData.start_date && updatedFormData.period) {
        const startDate = new Date(updatedFormData.start_date);
        let endDate = new Date(startDate);
        
        switch (updatedFormData.period) {
          case 'weekly':
            endDate.setDate(startDate.getDate() + 6);
            break;
          case 'monthly':
            endDate.setMonth(startDate.getMonth() + 1);
            endDate.setDate(0); // Last day of the month
            break;
          case 'quarterly':
            endDate.setMonth(startDate.getMonth() + 3);
            endDate.setDate(0);
            break;
          case 'yearly':
            endDate.setFullYear(startDate.getFullYear() + 1);
            endDate.setDate(0);
            break;
        }
        
        setFormData(prev => ({
          ...prev,
          [field]: value,
          end_date: endDate.toISOString().split('T')[0]
        }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BudgetFormData, string>> = {};

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Budget name is required';
    }
    
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    
    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }

    if (formData.start_date && formData.end_date && formData.start_date >= formData.end_date) {
      newErrors.end_date = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      try {
        if (isEditing && budget) {
          await api.updateBudget(budget.id, formData);
        } else {
          await api.createBudget(formData);
        }
        
        // Reset form
        setFormData({
          category_id: 0,
          name: '',
          amount: 0,
          period: 'monthly',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
          status: 'active',
          notes: ''
        });
        setErrors({});
        
        // Refresh budgets list
        if ((window as any).refreshBudgets) {
          (window as any).refreshBudgets();
        }
        
        onClose();
      } catch (error) {
        console.error('Error saving budget:', error);
        alert('Failed to save budget. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      category_id: 0,
      name: '',
      amount: 0,
      period: 'monthly',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
      status: 'active',
      notes: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal" id="budgetModal" style={{ display: 'flex' }}>
      <div className="modal-content">
        <div className="modal-header">
          <h3 id="budgetModalTitle">{isEditing ? 'Edit Budget' : 'Add Budget'}</h3>
          <button className="modal-close" onClick={handleCancel}>&times;</button>
        </div>
        <div className="modal-body">
          <form id="budgetForm" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                className={`form-control ${errors.category_id ? 'error' : ''}`}
                id="budgetCategory" 
                value={formData.category_id || ''}
                onChange={(e) => handleInputChange('category_id', parseInt(e.target.value))}
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
              {errors.category_id && <span className="error-text">{errors.category_id}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Budget Name</label>
              <input 
                type="text" 
                className={`form-control ${errors.name ? 'error' : ''}`}
                id="budgetName" 
                placeholder="Enter budget name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required 
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>
            
            <div className="form-group">
              <label className="form-label">Amount</label>
              <input 
                type="number" 
                className={`form-control ${errors.amount ? 'error' : ''}`}
                id="budgetAmount" 
                placeholder="0.00" 
                step="0.01" 
                value={formData.amount || ''}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value))}
                required 
              />
              {errors.amount && <span className="error-text">{errors.amount}</span>}
            </div>
            
            <div className="form-group">
              <label className="form-label">Period</label>
              <select 
                className="form-control"
                id="budgetPeriod" 
                value={formData.period}
                onChange={(e) => handleInputChange('period', e.target.value as 'weekly' | 'monthly' | 'quarterly' | 'yearly')}
                required
              >
                {periods.map(period => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input 
                  type="date" 
                  className={`form-control ${errors.start_date ? 'error' : ''}`}
                  id="budgetStartDate" 
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  required 
                />
                {errors.start_date && <span className="error-text">{errors.start_date}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input 
                  type="date" 
                  className={`form-control ${errors.end_date ? 'error' : ''}`}
                  id="budgetEndDate" 
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  required 
                />
                {errors.end_date && <span className="error-text">{errors.end_date}</span>}
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Status</label>
              <select 
                className="form-control"
                id="budgetStatus" 
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'paused' | 'completed')}
                required
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Notes (Optional)</label>
              <textarea 
                className="form-control" 
                id="budgetNotes" 
                placeholder="Enter any additional notes"
                rows={3}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </div>
            
            <div className="modal-actions">
              <button type="button" className="btn btn--outline" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" className="btn btn--primary" disabled={loading}>
                {loading ? 'Saving...' : (isEditing ? 'Update Budget' : 'Save Budget')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};