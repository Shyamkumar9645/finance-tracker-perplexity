import React, { useState } from 'react';

interface Budget {
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  limit: number;
  spent: number;
  period: string;
}

interface BudgetsSectionProps {
  onAddBudget?: () => void;
}

export const BudgetsSection: React.FC<BudgetsSectionProps> = ({ onAddBudget }) => {
  // Mock data matching the reference HTML structure
  const [budgets] = useState<Budget[]>([
    {
      categoryId: 1,
      categoryName: 'Food & Dining',
      categoryIcon: '🍽️',
      limit: 500,
      spent: 201.30,
      period: 'monthly'
    },
    {
      categoryId: 2,
      categoryName: 'Transportation',
      categoryIcon: '🚗',
      limit: 200,
      spent: 60.50,
      period: 'monthly'
    },
    {
      categoryId: 3,
      categoryName: 'Shopping',
      categoryIcon: '🛍️',
      limit: 300,
      spent: 67.80,
      period: 'monthly'
    },
    {
      categoryId: 4,
      categoryName: 'Entertainment',
      categoryIcon: '🎬',
      limit: 150,
      spent: 55.99,
      period: 'monthly'
    },
    {
      categoryId: 5,
      categoryName: 'Bills & Utilities',
      categoryIcon: '⚡',
      limit: 400,
      spent: 162.30,
      period: 'monthly'
    },
    {
      categoryId: 6,
      categoryName: 'Healthcare',
      categoryIcon: '🏥',
      limit: 200,
      spent: 89.99,
      period: 'monthly'
    },
    {
      categoryId: 7,
      categoryName: 'Education',
      categoryIcon: '📚',
      limit: 250,
      spent: 120.00,
      period: 'monthly'
    }
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

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