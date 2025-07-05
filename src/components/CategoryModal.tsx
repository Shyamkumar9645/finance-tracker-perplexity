import React, { useState } from 'react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (category: CategoryFormData) => void;
}

interface CategoryFormData {
  name: string;
  icon: string;
  color: string;
  budgetLimit: number;
  type: 'income' | 'expense';
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    icon: '',
    color: '#3498db',
    budgetLimit: 0,
    type: 'expense'
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CategoryFormData, string>>>({});

  const popularIcons = [
    '🍕', '🚗', '🎬', '⚡', '🏥', '📚', '🛒', '✈️',
    '💰', '💼', '📱', '🏠', '👕', '🎮', '☕', '🎵',
    '🏋️', '🐕', '💡', '🔧', '📄', '🎁', '💊', '🚌'
  ];

  const predefinedColors = [
    '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
    '#1abc9c', '#e67e22', '#34495e', '#f1c40f', '#95a5a6',
    '#e91e63', '#673ab7', '#ff5722', '#607d8b', '#795548'
  ];

  const handleInputChange = (field: keyof CategoryFormData, value: any) => {
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
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CategoryFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }
    
    if (!formData.icon.trim()) {
      newErrors.icon = 'Icon is required';
    }
    
    if (!formData.color) {
      newErrors.color = 'Color is required';
    }

    if (formData.type === 'expense' && formData.budgetLimit < 0) {
      newErrors.budgetLimit = 'Budget limit cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      // Reset form
      setFormData({
        name: '',
        icon: '',
        color: '#3498db',
        budgetLimit: 0,
        type: 'expense'
      });
      setErrors({});
      onClose();
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      icon: '',
      color: '#3498db',
      budgetLimit: 0,
      type: 'expense'
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal" id="categoryModal">
      <div className="modal-content">
        <div className="modal-header">
          <h3 id="categoryModalTitle">Add Category</h3>
          <button className="modal-close" onClick={handleCancel}>&times;</button>
        </div>
        <div className="modal-body">
          <form id="categoryForm" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Category Type</label>
              <div className="transaction-type-toggle">
                <input 
                  type="radio" 
                  id="expenseCategory" 
                  name="categoryType" 
                  value="expense" 
                  checked={formData.type === 'expense'}
                  onChange={(e) => handleInputChange('type', e.target.value as 'expense')}
                />
                <label htmlFor="expenseCategory" className="expense-label">Expense</label>
                <input 
                  type="radio" 
                  id="incomeCategory" 
                  name="categoryType" 
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={(e) => handleInputChange('type', e.target.value as 'income')}
                />
                <label htmlFor="incomeCategory" className="income-label">Income</label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Category Name</label>
              <input 
                type="text" 
                className={`form-control ${errors.name ? 'error' : ''}`}
                id="categoryName" 
                placeholder="Enter category name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required 
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>
            
            <div className="form-group">
              <label className="form-label">Icon</label>
              <div className="icon-selection">
                <input 
                  type="text" 
                  className={`form-control ${errors.icon ? 'error' : ''}`}
                  id="categoryIcon" 
                  placeholder="Enter emoji icon or select below"
                  value={formData.icon}
                  onChange={(e) => handleInputChange('icon', e.target.value)}
                  required 
                />
                <div className="popular-icons">
                  {popularIcons.map((icon, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`icon-option ${formData.icon === icon ? 'selected' : ''}`}
                      onClick={() => handleInputChange('icon', icon)}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              {errors.icon && <span className="error-text">{errors.icon}</span>}
            </div>
            
            <div className="form-group">
              <label className="form-label">Color</label>
              <div className="color-selection">
                <input 
                  type="color" 
                  className={`form-control color-input ${errors.color ? 'error' : ''}`}
                  id="categoryColor" 
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  required 
                />
                <div className="predefined-colors">
                  {predefinedColors.map((color, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`color-option ${formData.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleInputChange('color', color)}
                    />
                  ))}
                </div>
              </div>
              {errors.color && <span className="error-text">{errors.color}</span>}
            </div>
            
            {formData.type === 'expense' && (
              <div className="form-group">
                <label className="form-label">Budget Limit (Optional)</label>
                <input 
                  type="number" 
                  className={`form-control ${errors.budgetLimit ? 'error' : ''}`}
                  id="categoryBudget" 
                  placeholder="0.00" 
                  step="0.01"
                  value={formData.budgetLimit || ''}
                  onChange={(e) => handleInputChange('budgetLimit', parseFloat(e.target.value) || 0)}
                />
                {errors.budgetLimit && <span className="error-text">{errors.budgetLimit}</span>}
                <small className="form-help">Set a monthly budget limit for this category</small>
              </div>
            )}
            
            <div className="modal-actions">
              <button type="button" className="btn btn--outline" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" className="btn btn--primary">
                Save Category
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};