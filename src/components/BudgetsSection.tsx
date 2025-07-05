import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import { api } from '../utils/api';

interface BudgetsSectionProps {
  onAddBudget?: () => void;
  onEditBudget?: (budget: any) => void;
}

interface CategoryBudget {
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  limit: number;
  spent: number;
  period: string;
}

export const BudgetsSection: React.FC<BudgetsSectionProps> = ({ onAddBudget }) => {
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesData, transactionsData] = await Promise.all([
        api.getCategories(),
        api.getTransactions()
      ]);
      
      calculateBudgets(categoriesData, transactionsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBudgets = (categories: Category[], transactions: any[]) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const categoryBudgets = categories
      .filter(cat => cat.budget_limit > 0)
      .map(category => {
        const spent = transactions
          .filter(t => t.type === 'expense' && t.category === category.name)
          .filter(t => {
            const transactionDate = new Date(t.transaction_date);
            return transactionDate.getMonth() === currentMonth && 
                   transactionDate.getFullYear() === currentYear;
          })
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        return {
          categoryId: category.id,
          categoryName: category.name,
          categoryIcon: category.icon || '📝',
          limit: category.budget_limit,
          spent: spent,
          period: "monthly"
        };
      });
    
    setBudgets(categoryBudgets);
  };

  // Add this function to handle the refresh after a new budget is added
  const refreshBudgets = () => {
    loadData();
  };

  // Expose this function so parent components can call it
  React.useEffect(() => {
    // Store the refresh function on the window object so it can be called from App.tsx
    (window as any).refreshBudgets = refreshBudgets;
    
    return () => {
      delete (window as any).refreshBudgets;
    };
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <section className="content-section active" id="budgets">
        <div className="loading">Loading budgets...</div>
      </section>
    );
  }

  return (
    <section className="content-section active" id="budgets">
      <div className="budget-grid" id="budgetGrid">
        {budgets.length === 0 ? (
          <div className="empty-state">
            <h3>No budgets set</h3>
            <p>Create your first budget to track your spending</p>
          </div>
        ) : (
          budgets.map(budget => {
            const percentage = (budget.spent / budget.limit) * 100;
            const remaining = budget.limit - budget.spent;
            
            return (
              <div key={budget.categoryId} className="budget-card">
                <div className="budget-header">
                  <div className="budget-category">
                    {budget.categoryIcon} {budget.categoryName}
                  </div>
                  <div className="budget-amount">
                    {formatCurrency(budget.limit)}
                  </div>
                </div>
                <div className="budget-progress">
                  <div className="progress-bar">
                    <div 
                      className={`progress-fill ${percentage > 90 ? 'danger' : percentage > 70 ? 'warning' : ''}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="budget-stats">
                  <span>Spent: {formatCurrency(budget.spent)}</span>
                  <span>Remaining: {formatCurrency(Math.max(0, remaining))}</span>
                </div>
                <div className="budget-stats">
                  <span>{percentage.toFixed(1)}% used</span>
                  <span className={`status-indicator ${percentage > 90 ? 'danger' : percentage > 70 ? 'warning' : 'success'}`}>
                    {percentage > 90 ? 'Over Budget' : percentage > 70 ? 'Warning' : 'On Track'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};