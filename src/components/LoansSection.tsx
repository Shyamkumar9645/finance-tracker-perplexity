import React, { useState, useEffect } from 'react';
import { Borrower, LoanSummary } from '../types';
import { BorrowerCard } from './BorrowerCard';
import { BorrowerModal } from './BorrowerModal';
import { LoanTransactionModal } from './LoanTransactionModal';
import { BorrowerDetail } from './BorrowerDetail';

interface LoansSectionProps {
  onAddBorrower: () => void;
  onAddTransaction: () => void;
}

export const LoansSection: React.FC<LoansSectionProps> = ({ 
  onAddBorrower, 
  onAddTransaction 
}) => {
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [summary, setSummary] = useState<LoanSummary>({
    totalLent: 0,
    totalOutstanding: 0,
    totalInterest: 0,
    activeBorrowers: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'overdue'>('all');
  const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(null);
  const [showBorrowerModal, setShowBorrowerModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  
  const [editingBorrower, setEditingBorrower] = useState<Borrower | null>(null);
  const [transactionModalBorrowerId, setTransactionModalBorrowerId] = useState<number | undefined>(undefined);

  useEffect(() => {
    fetchBorrowers();
  }, []);

  const fetchBorrowers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/borrowers');
      const data = await response.json();
      setBorrowers(data);
      calculateSummary(data);
    } catch (error) {
      console.error('Error fetching borrowers:', error);
    }
  };

  const calculateSummary = (borrowerData: Borrower[]) => {
    const totalLent = borrowerData.reduce((sum, b) => sum + b.totalLent, 0);
    const totalOutstanding = borrowerData.reduce((sum, b) => sum + b.outstanding, 0);
    const totalInterest = borrowerData.reduce((sum, b) => sum + b.totalInterest, 0);
    const activeBorrowers = borrowerData.filter(b => b.outstanding > 0).length;

    setSummary({
      totalLent,
      totalOutstanding,
      totalInterest,
      activeBorrowers
    });
  };

  const getBorrowerStatus = (borrower: Borrower): 'current' | 'pending' | 'overdue' => {
    if (borrower.outstanding <= 0) return 'current';
    
    const now = new Date();
    const hasOverdue = borrower.transactions.some(transaction => {
      if (transaction.type === 'given' && transaction.due_date) {
        return new Date(transaction.due_date) < now;
      }
      return false;
    });

    return hasOverdue ? 'overdue' : 'pending';
  };

  const getFilteredBorrowers = () => {
    let filtered = borrowers;

    if (searchTerm) {
      filtered = filtered.filter(borrower => 
        borrower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (borrower.contact && borrower.contact.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(borrower => {
        const status = getBorrowerStatus(borrower);
        return status === filterStatus;
      });
    }

    return filtered;
  };

  const handleBorrowerClick = (borrower: Borrower) => {
    setSelectedBorrower(borrower);
  };

  const handleAddBorrower = () => {
    setEditingBorrower(null);
    setShowBorrowerModal(true);
  };

  const handleEditBorrower = (borrower: Borrower) => {
    setEditingBorrower(borrower);
    setShowBorrowerModal(true);
  };

  const handleAddTransaction = (borrowerId?: number) => {
    setTransactionModalBorrowerId(borrowerId);
    setShowTransactionModal(true);
  };

  const handleBorrowerSaved = (borrower: Borrower) => {
    if (editingBorrower) {
      setBorrowers(prev => prev.map(b => b.id === borrower.id ? borrower : b));
    } else {
      setBorrowers(prev => [...prev, borrower]);
    }
    setShowBorrowerModal(false);
    setEditingBorrower(null);
    calculateSummary(borrowers);
  };

  const handleTransactionSaved = () => {
    fetchBorrowers();
    setShowTransactionModal(false);
    setTransactionModalBorrowerId(undefined);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  if (selectedBorrower) {
    return (
      <BorrowerDetail 
        borrower={selectedBorrower}
        onBack={() => setSelectedBorrower(null)}
        onAddTransaction={() => handleAddTransaction(selectedBorrower.id)}
        onEditBorrower={() => handleEditBorrower(selectedBorrower)}
        onBorrowerUpdated={fetchBorrowers}
      />
    );
  }


  return (
    <div className="loans-section">
      {/* Dashboard Summary */}
      <section className="dashboard-summary">
        <div className="summary-cards">
          <div className="card summary-card">
            <div className="card__body">
              <h3>Total Lent</h3>
              <div className="amount-display">{formatCurrency(summary.totalLent)}</div>
            </div>
          </div>
          <div className="card summary-card">
            <div className="card__body">
              <h3>Total Outstanding</h3>
              <div className="amount-display">{formatCurrency(summary.totalOutstanding)}</div>
            </div>
          </div>
          <div className="card summary-card">
            <div className="card__body">
              <h3>Total Interest Earned</h3>
              <div className="amount-display">{formatCurrency(summary.totalInterest)}</div>
            </div>
          </div>
          <div className="card summary-card">
            <div className="card__body">
              <h3>Active Borrowers</h3>
              <div className="amount-display">{summary.activeBorrowers}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="filters">
        <div className="filter-controls">
          <input
            type="text"
            className="form-control"
            placeholder="Search borrowers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="form-control"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'pending' | 'overdue')}
          >
            <option value="all">All Borrowers</option>
            <option value="pending">Pending Payments</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </section>

      {/* Borrowers */}
      <section className="borrowers-section">
        <div className="section-header">
          <h2>Borrowers</h2>
          <button 
            className="btn btn--primary"
            onClick={handleAddBorrower}
          >
            Add Borrower
          </button>
        </div>
        
        <div className="borrowers-grid">
          {getFilteredBorrowers().length === 0 ? (
            <div className="empty-state">
              <h3>No borrowers found</h3>
              <p>Add a borrower to get started</p>
              <button 
                className="btn btn--primary"
                onClick={handleAddBorrower}
              >
                Add Borrower
              </button>
            </div>
          ) : (
            getFilteredBorrowers().map(borrower => (
              <BorrowerCard
                key={borrower.id}
                borrower={borrower}
                status={getBorrowerStatus(borrower)}
                onClick={() => handleBorrowerClick(borrower)}
                formatCurrency={formatCurrency}
              />
            ))
          )}
        </div>
      </section>

      {/* Modals */}
      <BorrowerModal
        isOpen={showBorrowerModal}
        onClose={() => setShowBorrowerModal(false)}
        borrower={editingBorrower}
        onSave={handleBorrowerSaved}
      />

      <LoanTransactionModal
        isOpen={showTransactionModal}
        onClose={() => {
          setShowTransactionModal(false);
          setTransactionModalBorrowerId(undefined);
        }}
        borrowers={borrowers}
        transaction={null}
        defaultBorrowerId={transactionModalBorrowerId}
        onSave={handleTransactionSaved}
      />
    </div>
  );
};