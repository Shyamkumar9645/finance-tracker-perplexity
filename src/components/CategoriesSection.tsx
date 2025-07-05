import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import { api } from '../utils/api';

interface CategoriesSectionProps {
  onAddCategory?: () => void;
  onEditCategory?: (category: Category) => void;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({ onAddCategory, onEditCategory }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await api.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleEditCategory = (category: Category) => {
    console.log('CategoriesSection: Edit button clicked', category);
    if (onEditCategory) {
      onEditCategory(category);
    } else {
      console.warn('CategoriesSection: onEditCategory prop not provided');
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    console.log('CategoriesSection: Delete button clicked', categoryId);
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await api.deleteCategory(categoryId);
        await loadCategories(); // Refresh the list
        
        // Also refresh budgets since categories affect budgets
        if ((window as any).refreshBudgets) {
          (window as any).refreshBudgets();
        }
        if ((window as any).refreshDashboard) {
          (window as any).refreshDashboard();
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category. Please try again.');
      }
    }
  };

  // Add this function to handle the refresh after a new category is added
  const refreshCategories = () => {
    loadCategories();
  };

  // Expose this function so parent components can call it
  React.useEffect(() => {
    // Store the refresh function on the window object so it can be called from App.tsx
    (window as any).refreshCategories = refreshCategories;
    
    return () => {
      delete (window as any).refreshCategories;
    };
  }, []);

  if (loading) {
    return (
      <section className="content-section active" id="categories">
        <div className="loading">Loading categories...</div>
      </section>
    );
  }

  return (
    <section className="content-section active" id="categories">
      <div className="category-grid" id="categoryGrid">
        {categories.length > 0 ? (
          categories.map(category => (
            <div key={category.id} className="category-card">
              <div className="category-icon">{category.icon || '📂'}</div>
              <div className="category-name">{category.name}</div>
              <div className="category-budget">
                {category.budget_limit > 0 
                  ? `Budget: ${formatCurrency(category.budget_limit)}` 
                  : 'No budget set'
                }
              </div>
              <div className="category-actions" style={{ marginTop: '12px' }}>
                <button 
                  className="btn btn--sm btn--outline" 
                  onClick={() => {
                    console.log('Category Edit button clicked!');
                    handleEditCategory(category);
                  }}
                >
                  Edit
                </button>
                <button 
                  className="btn btn--sm btn--outline" 
                  onClick={() => {
                    console.log('Category Delete button clicked!');
                    handleDeleteCategory(category.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <h3>No categories found</h3>
            <p>Create your first category to get started.</p>
            <button 
              className="btn btn--primary"
              onClick={onAddCategory}
            >
              + Add Category
            </button>
          </div>
        )}
      </div>
    </section>
  );
};