import React, { useState, useEffect } from 'react';
import { Loan, LoanBalance } from '../types';
import { api } from '../utils/api';

interface LoanListProps {
  loans: Loan[];
  onSelectLoan: (loan: Loan) => void;
}

export const LoanList: React.FC<LoanListProps> = ({ loans, onSelectLoan }) => {
  const [balances, setBalances] = useState<Record<number, LoanBalance>>({});

  // Ensure loans is always an array
  const loansArray = Array.isArray(loans) ? loans : [];

  useEffect(() => {
    const fetchBalances = async () => {
      const balancePromises = loansArray.map(async (loan) => {
        try {
          const balance = await api.getLoanBalance(loan.id);
          return { loanId: loan.id, balance };
        } catch (error) {
          console.error(`Error fetching balance for loan ${loan.id}:`, error);
          return null;
        }
      });

      const results = await Promise.all(balancePromises);
      const balanceMap: Record<number, LoanBalance> = {};
      results.forEach((result) => {
        if (result) {
          balanceMap[result.loanId] = result.balance;
        }
      });
      setBalances(balanceMap);
    };

    if (loansArray.length > 0) {
      fetchBalances();
    }
  }, [loansArray]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'paid': return '#2196F3';
      case 'defaulted': return '#F44336';
      default: return '#757575';
    }
  };

  return (
    <div className="loan-list">
      <h2>Loans</h2>
      {loansArray.length === 0 ? (
        <p>No loans yet. Create your first loan to get started.</p>
      ) : (
        <div className="loans-grid">
          {loansArray.map(loan => {
            const balance = balances[loan.id];
            return (
              <div key={loan.id} className="loan-card" onClick={() => onSelectLoan(loan)}>
                <div className="loan-header">
                  <h3>{loan.contact_name}</h3>
                  <span 
                    className="loan-status" 
                    style={{ backgroundColor: getStatusColor(loan.status) }}
                  >
                    {loan.status}
                  </span>
                </div>
                
                <div className="loan-details">
                  <p><strong>Original Amount:</strong> {formatCurrency(loan.amount)}</p>
                  <p><strong>Interest Rate:</strong> {loan.interest_rate}% ({loan.interest_type})</p>
                  <p><strong>Start Date:</strong> {new Date(loan.start_date).toLocaleDateString()}</p>
                  {loan.due_date && (
                    <p><strong>Due Date:</strong> {new Date(loan.due_date).toLocaleDateString()}</p>
                  )}
                </div>

                {balance && (
                  <div className="loan-balance">
                    <p><strong>Current Balance:</strong> {formatCurrency(balance.balance)}</p>
                    <p><strong>Total Owed:</strong> {formatCurrency(balance.total_owed)}</p>
                    <p><strong>Total Paid:</strong> {formatCurrency(balance.total_paid)}</p>
                    <p><strong>Days Elapsed:</strong> {balance.days_elapsed}</p>
                  </div>
                )}

                {loan.notes && (
                  <div className="loan-notes">
                    <p><strong>Notes:</strong> {loan.notes}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};