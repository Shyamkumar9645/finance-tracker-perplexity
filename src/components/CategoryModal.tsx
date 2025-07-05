import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import { api } from '../utils/api';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null; // For editing
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  category
}) => {
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    color: '#000000',
    budget_limit: 0
  });

  const [loading, setLoading] = useState(false);
  const isEditing = !!category;

  // Update form data when category prop changes
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        icon: category.icon || '',
        color: category.color || '#000000',
        budget_limit: category.budget_limit || 0
      });
    } else {
      setFormData({
        name: '',
        icon: '',
        color: '#000000',
        budget_limit: 0
      });
    }
  }, [category, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('CategoryModal: Form submitted', formData);
    
    if (!formData.name.trim()) {
      alert('Category name is required');
      return;
    }
    
    if (!formData.icon.trim()) {
      alert('Icon is required');
      return;
    }

    setLoading(true);
    try {
      const categoryData = {
        name: formData.name.trim(),
        icon: formData.icon.trim(),
        color: formData.color,
        budget_limit: parseFloat(formData.budget_limit.toString()) || 0,
        type: 'expense' as 'expense' | 'income' // Default to expense for simplicity
      };

      console.log('CategoryModal: Sending data to API', categoryData);

      if (isEditing && category) {
        console.log('CategoryModal: Updating category', category.id);
        await api.updateCategory(category.id, categoryData);
      } else {
        console.log('CategoryModal: Creating new category');
        await api.createCategory(categoryData);
      }
      
      console.log('CategoryModal: API call successful');
      
      // Reset form
      setFormData({
        name: '',
        icon: '',
        color: '#000000',
        budget_limit: 0
      });
      
      // Refresh categories list
      console.log('CategoryModal: Calling refresh function');
      if ((window as any).refreshCategories) {
        (window as any).refreshCategories();
      } else {
        console.warn('CategoryModal: refreshCategories function not found');
      }
      
      console.log('CategoryModal: Closing modal');
      onClose();
    } catch (error) {
      console.error('CategoryModal: Error saving category:', error);
      alert(`Failed to save category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      icon: '',
      color: '#000000',
      budget_limit: 0
    });
    onClose();
  };

  console.log('CategoryModal render: isOpen:', isOpen, 'category:', category);
  
  if (!isOpen) return null;

  return (
    <div className="modal active" id="categoryModal">
      <div className="modal-content">
        <div className="modal-header">
          <h3 id="categoryModalTitle">{isEditing ? 'Edit Category' : 'Add Category'}</h3>
          <button className="modal-close" id="closeCategoryModal" onClick={handleCancel}>&times;</button>
        </div>
        <div className="modal-body">
          <form id="categoryForm" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Category Name</label>
              <input 
                type="text" 
                className="form-control" 
                id="categoryName" 
                placeholder="Enter category name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Icon</label>
              <input 
                type="text" 
                className="form-control" 
                id="categoryIcon" 
                placeholder="Enter emoji icon"
                value={formData.icon}
                onChange={(e) => handleInputChange('icon', e.target.value)}
                required 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Color</label>
              <input 
                type="color" 
                className="form-control" 
                id="categoryColor"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                required 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Budget Limit</label>
              <input 
                type="number" 
                className="form-control" 
                id="categoryBudget" 
                placeholder="0.00" 
                step="0.01"
                value={formData.budget_limit || ''}
                onChange={(e) => handleInputChange('budget_limit', parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div className="modal-actions">
              <button type="button" className="btn btn--outline" id="cancelCategoryBtn" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" className="btn btn--primary" id="saveCategoryBtn" disabled={loading}>
                {loading ? 'Saving...' : 'Save Category'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};