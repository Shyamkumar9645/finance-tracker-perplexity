import React, { useState } from 'react';

interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  budgetLimit: number;
}

interface CategoriesSectionProps {
  onAddCategory?: () => void;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({ onAddCategory }) => {
  // Mock data matching the reference HTML structure
  const [categories] = useState<Category[]>([
    {id: 1, name: "Food & Dining", icon: "🍽️", color: "#f59e0b", budgetLimit: 500},
    {id: 2, name: "Transportation", icon: "🚗", color: "#3b82f6", budgetLimit: 200},
    {id: 3, name: "Shopping", icon: "🛍️", color: "#ec4899", budgetLimit: 300},
    {id: 4, name: "Entertainment", icon: "🎬", color: "#8b5cf6", budgetLimit: 150},
    {id: 5, name: "Bills & Utilities", icon: "⚡", color: "#ef4444", budgetLimit: 400},
    {id: 6, name: "Healthcare", icon: "🏥", color: "#10b981", budgetLimit: 200},
    {id: 7, name: "Education", icon: "📚", color: "#06b6d4", budgetLimit: 250},
    {id: 8, name: "Travel", icon: "✈️", color: "#84cc16", budgetLimit: 500},
    {id: 9, name: "Salary", icon: "💼", color: "#10b981", budgetLimit: 0},
    {id: 10, name: "Freelance", icon: "💻", color: "#10b981", budgetLimit: 0},
    {id: 11, name: "Investment", icon: "📈", color: "#10b981", budgetLimit: 0}
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleEditCategory = (categoryId: number) => {
    console.log('Edit category:', categoryId);
    // TODO: Implement edit functionality
  };

  const handleDeleteCategory = (categoryId: number) => {
    console.log('Delete category:', categoryId);
    // TODO: Implement delete functionality
  };

  return (
    <section className="content-section active" id="categories">
      <div className="category-grid" id="categoryGrid">
        {categories.map(category => (
          <div key={category.id} className="category-card">
            <div className="category-icon">{category.icon}</div>
            <div className="category-name">{category.name}</div>
            <div className="category-budget">
              {category.budgetLimit > 0 ? `Budget: ${formatCurrency(category.budgetLimit)}` : 'No budget set'}
            </div>
            <div className="category-actions" style={{ marginTop: '12px' }}>
              <button 
                className="btn btn--sm btn--outline" 
                onClick={() => handleEditCategory(category.id)}
              >
                Edit
              </button>
              <button 
                className="btn btn--sm btn--outline" 
                onClick={() => handleDeleteCategory(category.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};