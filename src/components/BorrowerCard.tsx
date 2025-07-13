import React from 'react';
import { Borrower } from '../types';

interface BorrowerCardProps {
  borrower: Borrower;
  status: 'current' | 'pending' | 'overdue';
  onClick: () => void;
  formatCurrency: (amount: number) => string;
}

export const BorrowerCard: React.FC<BorrowerCardProps> = ({
  borrower,
  status,
  onClick,
  formatCurrency
}) => {
  const getStatusText = () => {
    switch (status) {
      case 'current': return 'Current';
      case 'overdue': return 'Overdue';
      case 'pending': return 'Pending';
      default: return 'Unknown';
    }
  };

  return (
    <div className="card borrower-card fade-in" onClick={onClick}>
      <div className="card__body">
        <div className="borrower-header">
          <div>
            <h3 className="borrower-name">{borrower.name}</h3>
            {borrower.contact && (
              <p className="borrower-contact">{borrower.contact}</p>
            )}
          </div>
          <div className={`status-badge status-badge--${status}`}>
            {getStatusText()}
          </div>
        </div>
        <div className="borrower-stats">
          <div className="stat-item">
            <span className="stat-label">Lent:</span>
            <span className="stat-value">{formatCurrency(borrower.totalLent)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Outstanding:</span>
            <span className={`stat-value ${borrower.outstanding > 0 ? 'negative' : 'positive'}`}>
              {formatCurrency(borrower.outstanding)}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Received:</span>
            <span className="stat-value positive">{formatCurrency(borrower.totalReceived)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Interest:</span>
            <span className="stat-value positive">{formatCurrency(borrower.totalInterest)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};