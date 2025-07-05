import React from 'react';

export const ReportsSection: React.FC = () => {
  const exportData = () => {
    // Mock export functionality
    alert('Data export feature would be implemented here');
  };

  return (
    <section className="content-section active" id="reports">
      <div className="reports-content">
        <div className="card">
          <div className="card__header">
            <h3>Income vs Expenses</h3>
          </div>
          <div className="card__body">
            <canvas id="incomeExpenseChart" width="400" height="200"></canvas>
          </div>
        </div>

        <div className="card">
          <div className="card__header">
            <h3>Spending by Category</h3>
          </div>
          <div className="card__body">
            <canvas id="categorySpendingChart" width="400" height="200"></canvas>
          </div>
        </div>
      </div>
    </section>
  );
};