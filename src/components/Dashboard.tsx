import React from 'react';

interface DashboardProps {
  loans: any[];
  balances: Record<number, any>;
  onAddTransaction: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onAddTransaction }) => {
  // Mock data for demonstration
  const dashboardData = {
    totalBalance: 0.00,
    monthlyIncome: 0.00,
    monthlyExpenses: 0.00,
    savingsRate: 0
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const recentTransactions = [
    { id: 1, category: 'Food & Dining', description: 'Grocery shopping', amount: -85.50, type: 'expense', icon: '🍕' },
    { id: 2, category: 'Entertainment', description: 'Movie tickets', amount: -25.99, type: 'expense', icon: '🎬' },
    { id: 3, category: 'Transportation', description: 'Gas station', amount: -45.00, type: 'expense', icon: '🚗' },
    { id: 4, category: 'Bills & Utilities', description: 'Electricity bill', amount: -120.00, type: 'expense', icon: '⚡' },
    { id: 5, category: 'Salary', description: 'Monthly salary', amount: 3500.00, type: 'income', icon: '💰' }
  ];

  const budgetOverview = [
    { category: 'Food & Dining', icon: '🍕', spent: 0, budget: 500.00, color: '#e74c3c' },
    { category: 'Transportation', icon: '🚗', spent: 0, budget: 200.00, color: '#3498db' },
    { category: 'Shopping', icon: '🛒', spent: 0, budget: 300.00, color: '#9b59b6' },
    { category: 'Entertainment', icon: '🎬', spent: 0, budget: 150.00, color: '#f39c12' },
    { category: 'Bills & Utilities', icon: '⚡', spent: 0, budget: 400.00, color: '#2ecc71' },
    { category: 'Healthcare', icon: '🏥', spent: 0, budget: 200.00, color: '#e67e22' },
    { category: 'Education', icon: '📚', spent: 0, budget: 250.00, color: '#1abc9c' }
  ];

  return (
    <section className="content-section active" id="dashboard">
      <div className="section-header">
        <h1>Dashboard</h1>
        <button className="btn btn--primary" onClick={onAddTransaction}>
          + Add Transaction
        </button>
      </div>

      {/* Financial Overview Cards */}
      <div className="overview-cards">
        <div className="card overview-card">
          <div className="card__body">
            <h3>Total Balance</h3>
            <div className="balance-amount">{formatCurrency(dashboardData.totalBalance)}</div>
          </div>
        </div>
        <div className="card overview-card">
          <div className="card__body">
            <h3>Monthly Income</h3>
            <div className="income-amount">{formatCurrency(dashboardData.monthlyIncome)}</div>
          </div>
        </div>
        <div className="card overview-card">
          <div className="card__body">
            <h3>Monthly Expenses</h3>
            <div className="expense-amount">{formatCurrency(dashboardData.monthlyExpenses)}</div>
          </div>
        </div>
        <div className="card overview-card">
          <div className="card__body">
            <h3>Savings Rate</h3>
            <div className="savings-rate">{dashboardData.savingsRate}%</div>
          </div>
        </div>
      </div>

      {/* Charts and Recent Transactions */}
      <div className="dashboard-content">
        <div className="dashboard-left">
          <div className="card">
            <div className="card__header">
              <h3>Monthly Spending Trend</h3>
            </div>
            <div className="card__body">
              <canvas id="spendingChart" width="400" height="200"></canvas>
            </div>
          </div>
          
          <div className="card">
            <div className="card__header">
              <h3>Budget Overview</h3>
            </div>
            <div className="card__body">
              <div id="budgetOverview">
                {budgetOverview.map((budget, index) => {
                  const percentage = budget.budget > 0 ? (budget.spent / budget.budget) * 100 : 0;
                  return (
                    <div key={index} className="budget-overview-item">
                      <div className="budget-category-info">
                        <span style={{ fontSize: '16px' }}>{budget.icon}</span>
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>{budget.category}</span>
                      </div>
                      <div className="budget-progress-mini">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ 
                              width: `${Math.min(percentage, 100)}%`,
                              backgroundColor: budget.color
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="budget-amount-mini">
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.budget)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        
        <div className="dashboard-right">
          <div className="card">
            <div className="card__header">
              <h3>Recent Transactions</h3>
            </div>
            <div className="card__body">
              <div id="recentTransactions">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="recent-transaction-item">
                    <div className="recent-transaction-info">
                      <span style={{ fontSize: '16px' }}>{transaction.icon}</span>
                      <div>
                        <div className="transaction-category">{transaction.category}</div>
                        <div className="transaction-description">{transaction.description}</div>
                      </div>
                    </div>
                    <div className={`recent-transaction-amount ${transaction.type}`}>
                      {transaction.type === 'income' ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <h3>Category Breakdown</h3>
            </div>
            <div className="card__body">
              <canvas id="categoryChart" width="300" height="300"></canvas>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};