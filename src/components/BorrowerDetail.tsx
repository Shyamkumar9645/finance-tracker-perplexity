import React, { useState, useEffect } from 'react';
import { Borrower, LoanTransaction } from '../types';

interface BorrowerDetailProps {
  borrower: Borrower;
  onBack: () => void;
  onAddTransaction: () => void;
  onEditBorrower: () => void;
  onBorrowerUpdated: () => void;
}

export const BorrowerDetail: React.FC<BorrowerDetailProps> = ({
  borrower,
  onBack,
  onAddTransaction,
  onEditBorrower,
  onBorrowerUpdated
}) => {
  const [transactions, setTransactions] = useState<LoanTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, [borrower.id]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`/api/borrowers/${borrower.id}/transactions`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderTransactions = () => {
    if (loading) {
      return <div className="loading">Loading transactions...</div>;
    }

    if (transactions.length === 0) {
      return (
        <div className="empty-state">
          <h3>No transactions yet</h3>
          <p>Add a transaction to get started</p>
        </div>
      );
    }

    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
    );

    return sortedTransactions.map(transaction => (
      <div key={transaction.id} className="transaction-item fade-in">
        <div className="transaction-main">
          <div className={`transaction-icon ${transaction.type}`}>
            {transaction.type === 'given' ? '↑' : '↓'}
          </div>
          <div className="transaction-details">
            <div className="transaction-description">
              {transaction.description || (transaction.type === 'given' ? 'Money Given' : 'Money Received')}
            </div>
            <div className="transaction-meta">
              {formatDate(transaction.transaction_date)} • {transaction.interest_rate}% interest
              {transaction.due_date && ` • Due: ${formatDate(transaction.due_date)}`}
            </div>
          </div>
        </div>
        <div className="transaction-amounts">
          <div className={`transaction-amount ${transaction.type}`}>
            {transaction.type === 'given' ? '-' : '+'}
            {formatCurrency(transaction.amount)}
          </div>
          {transaction.type === 'given' && transaction.interest_earned && (
            <div className="transaction-interest">
              Interest: {formatCurrency(transaction.interest_earned)}
            </div>
          )}
        </div>
      </div>
    ));
  };

  return (
    <div className="borrower-detail">
      <div className="section-header">
        <h2>{borrower.name}</h2>
        <div className="header-actions">
          <button className="btn btn--outline" onClick={onBack}>
            Back to Dashboard
          </button>
          <button className="btn btn--secondary" onClick={onEditBorrower}>
            Edit Borrower
          </button>
        </div>
      </div>
      
      <div className="borrower-stats">
        <div className="stat-item">
          <span className="stat-label">Total Lent:</span>
          <span className="stat-value">{formatCurrency(borrower.totalLent)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Received:</span>
          <span className="stat-value">{formatCurrency(borrower.totalReceived)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Outstanding:</span>
          <span className={`stat-value ${borrower.outstanding > 0 ? 'negative' : 'positive'}`}>
            {formatCurrency(borrower.outstanding)}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Interest Earned:</span>
          <span className="stat-value">{formatCurrency(borrower.totalInterest)}</span>
        </div>
      </div>
      
      <div className="transactions-section">
        <div className="section-header">
          <h3>Transaction History</h3>
          <button className="btn btn--primary" onClick={onAddTransaction}>
            Add Transaction
          </button>
        </div>
        <div className="transactions-list">
          {renderTransactions()}
        </div>
      </div>
    </div>
  );
};