import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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

export const ReportsSection: React.FC = () => {
  const [spendingTrend, setSpendingTrend] = useState<SpendingTrendData[]>([]);
  const [categorySpending, setCategorySpending] = useState<CategorySpendingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportsData();
  }, []);

  useEffect(() => {
    // Listen for export event from parent component
    const handleExport = () => {
      exportData();
    };
    
    document.addEventListener('export-data', handleExport);
    
    return () => {
      document.removeEventListener('export-data', handleExport);
    };
  }, [spendingTrend]);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      const [trendData, categoryData] = await Promise.all([
        api.getSpendingTrend(),
        api.getCategorySpending()
      ]);
      
      setSpendingTrend(trendData);
      setCategorySpending(categoryData);
    } catch (error) {
      console.error('Error loading reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const csvData = spendingTrend.map(item => ({
      Month: item.month,
      Income: item.income,
      Expenses: item.expenses,
      Net: item.net
    }));
    
    const csvContent = convertToCSV(csvData);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'financial-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    csvRows.push(headers.join(','));
    
    for (const row of data) {
      const values = headers.map(header => {
        const escaped = ('' + row[header]).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  };

  // Chart data for Income vs Expenses
  const incomeExpenseData = {
    labels: spendingTrend.map(item => item.month),
    datasets: [
      {
        label: 'Income',
        data: spendingTrend.map(item => item.income),
        backgroundColor: '#10b981',
      },
      {
        label: 'Expenses',
        data: spendingTrend.map(item => item.expenses),
        backgroundColor: '#ef4444',
      }
    ]
  };

  const incomeExpenseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '$' + value.toFixed(0);
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    }
  };

  // Chart data for Category Spending
  const categoryChartData = {
    labels: categorySpending.map(item => item.category),
    datasets: [
      {
        label: 'Spending by Category',
        data: categorySpending.map(item => item.total),
        backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B'],
      }
    ]
  };

  const categoryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '$' + value.toFixed(0);
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.label}: $${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <section className="content-section active" id="reports">
        <div className="loading">Loading reports...</div>
      </section>
    );
  }

  return (
    <section className="content-section active" id="reports">
      <div className="reports-content">
        <div className="card">
          <div className="card__header">
            <h3>Income vs Expenses</h3>
          </div>
          <div className="card__body">
            <div style={{ height: '300px' }}>
              {spendingTrend.length > 0 ? (
                <Bar data={incomeExpenseData} options={incomeExpenseOptions} />
              ) : (
                <div className="empty-chart">
                  <p>No income/expense data available</p>
                  <small>Add some transactions to see the comparison</small>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card__header">
            <h3>Spending by Category</h3>
          </div>
          <div className="card__body">
            <div style={{ height: '300px' }}>
              {categorySpending.length > 0 ? (
                <Bar data={categoryChartData} options={categoryChartOptions} />
              ) : (
                <div className="empty-chart">
                  <p>No category spending data available</p>
                  <small>Add some expense transactions to see breakdown</small>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};