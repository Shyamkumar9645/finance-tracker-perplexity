import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardProps {
  loans: any[];
  balances: Record<number, any>;
  onAddTransaction: () => void;
}

interface DashboardSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  totalIncome: number;
  totalExpenses: number;
}

interface RecentTransaction {
  id: number;
  category: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  transaction_date: string;
  category_icon?: string;
  category_color?: string;
}

interface CategoryBudget {
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  limit: number;
  spent: number;
  period: string;
}

interface SpendingTrendData {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

interface CategorySpendingData {
  category: string;
  total: number;
  icon: string;
  color: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ onAddTransaction }) => {
  const [dashboardData, setDashboardData] = useState<DashboardSummary>({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    savingsRate: 0,
    totalIncome: 0,
    totalExpenses: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [budgetOverview, setBudgetOverview] = useState<CategoryBudget[]>([]);
  const [spendingTrend, setSpendingTrend] = useState<SpendingTrendData[]>([]);
  const [categorySpending, setCategorySpending] = useState<CategorySpendingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [summary, transactions, categories, trend, spending] = await Promise.all([
        api.getDashboardSummary(),
        api.getRecentTransactions(),
        api.getCategories(),
        api.getSpendingTrend(),
        api.getCategorySpending()
      ]);
      
      setDashboardData(summary);
      setRecentTransactions(transactions.slice(0, 5)); // Show only 5 most recent
      setSpendingTrend(trend);
      setCategorySpending(spending);
      
      // Calculate budget overview from categories with budget limits
      const allTransactions = await api.getTransactions();
      calculateBudgetOverview(categories, allTransactions);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBudgetOverview = (categories: any[], transactions: any[]) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const budgets = categories
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
    
    setBudgetOverview(budgets);
  };

  // Refresh dashboard data when transactions are added
  React.useEffect(() => {
    const refreshDashboard = () => {
      loadDashboardData();
    };
    
    // Store the refresh function on the window object
    (window as any).refreshDashboard = refreshDashboard;
    
    return () => {
      delete (window as any).refreshDashboard;
    };
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Chart data preparation
  const spendingChartData = {
    labels: spendingTrend.map(item => item.month),
    datasets: [
      {
        label: 'Expenses',
        data: spendingTrend.map(item => item.expenses),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const spendingChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `$${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '$' + value.toFixed(0);
          }
        }
      }
    }
  };

  const categoryChartData = {
    labels: categorySpending.map(item => item.category),
    datasets: [
      {
        data: categorySpending.map(item => item.total),
        backgroundColor: categorySpending.map(item => item.color || '#6b7280'),
        borderWidth: 0,
      }
    ]
  };

  const categoryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 10,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${formatCurrency(value)}`;
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <section className="content-section active" id="dashboard">
        <div className="loading">Loading dashboard...</div>
      </section>
    );
  }

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
            <div className="balance-amount" id="totalBalance">
              {formatCurrency(dashboardData.totalBalance)}
            </div>
          </div>
        </div>
        <div className="card overview-card">
          <div className="card__body">
            <h3>Monthly Income</h3>
            <div className="income-amount" id="monthlyIncome">
              {formatCurrency(dashboardData.monthlyIncome)}
            </div>
          </div>
        </div>
        <div className="card overview-card">
          <div className="card__body">
            <h3>Monthly Expenses</h3>
            <div className="expense-amount" id="monthlyExpenses">
              {formatCurrency(dashboardData.monthlyExpenses)}
            </div>
          </div>
        </div>
        <div className="card overview-card">
          <div className="card__body">
            <h3>Savings Rate</h3>
            <div className="savings-rate" id="savingsRate">
              {dashboardData.savingsRate}%
            </div>
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
              <div style={{ height: '200px' }}>
                {spendingTrend.length > 0 ? (
                  <Line data={spendingChartData} options={spendingChartOptions} />
                ) : (
                  <div className="empty-chart">
                    <p>No spending data available</p>
                    <small>Add some transactions to see trends</small>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card__header">
              <h3>Budget Overview</h3>
            </div>
            <div className="card__body">
              <div id="budgetOverview">
                {budgetOverview.length === 0 ? (
                  <div className="empty-state">
                    <p>No budgets set</p>
                  </div>
                ) : (
                  budgetOverview.map((budget, index) => {
                    const percentage = (budget.spent / budget.limit) * 100;
                    return (
                      <div key={index} className="budget-overview-item">
                        <div className="budget-category-info">
                          <span>{budget.categoryIcon}</span>
                          <span>{budget.categoryName}</span>
                        </div>
                        <div className="budget-progress-mini">
                          <div className="progress-bar">
                            <div 
                              className={`progress-fill ${percentage > 90 ? 'danger' : percentage > 70 ? 'warning' : ''}`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="budget-amount-mini">
                          {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                        </div>
                      </div>
                    );
                  })
                )}
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
                {recentTransactions.length === 0 ? (
                  <div className="empty-state">
                    <p>No recent transactions</p>
                  </div>
                ) : (
                  recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="recent-transaction-item">
                      <div className="recent-transaction-info">
                        <span className="transaction-category">
                          {transaction.category_icon || '📝'} {transaction.category}
                        </span>
                        <div className="transaction-description">
                          {transaction.description || 'No description'}
                        </div>
                      </div>
                      <div className={`recent-transaction-amount ${transaction.type}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <h3>Category Breakdown</h3>
            </div>
            <div className="card__body">
              <div style={{ height: '300px' }}>
                {categorySpending.length > 0 ? (
                  <Doughnut data={categoryChartData} options={categoryChartOptions} />
                ) : (
                  <div className="empty-chart">
                    <p>No category data available</p>
                    <small>Add some expense transactions to see breakdown</small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};