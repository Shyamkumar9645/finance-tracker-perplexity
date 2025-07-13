import React, { useState, useEffect } from 'react';
import { LoanTransaction, Borrower } from '../types';

interface LoanTransactionsSectionProps {
  onAddTransaction: () => void;
}

export const LoanTransactionsSection: React.FC<LoanTransactionsSectionProps> = ({ 
  onAddTransaction 
}) => {
  const [transactions, setTransactions] = useState<LoanTransaction[]>([]);
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [filterBorrower, setFilterBorrower] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'lent' | 'received'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<LoanTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
    fetchBorrowers();
  }, []);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      // Fetch all borrowers first
      const borrowersResponse = await fetch('http://localhost:3001/api/borrowers');
      const borrowersData = await borrowersResponse.json();
      
      // Fetch transactions for each borrower
      const allTransactions: LoanTransaction[] = [];
      for (const borrower of borrowersData) {
        const transResponse = await fetch(`http://localhost:3001/api/borrowers/${borrower.id}/transactions`);
        const transactions = await transResponse.json();
        // Add borrower name to each transaction
        const transactionsWithBorrower = transactions.map((t: any) => ({
          ...t,
          borrower_name: borrower.name,
          transaction_date: t.date || t.transaction_date,
          amount: t.type === 'given' ? t.amount : -t.amount
        }));
        allTransactions.push(...transactionsWithBorrower);
      }
      
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error fetching loan transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBorrowers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/borrowers');
      const data = await response.json();
      setBorrowers(data);
    } catch (error) {
      console.error('Error fetching borrowers:', error);
    }
  };

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setShowTransactionModal(true);
  };

  const handleEditTransaction = (transaction: LoanTransaction) => {
    setEditingTransaction(transaction);
    setShowTransactionModal(true);
  };

  const handleSaveTransaction = async (transactionData: any) => {
    try {
      const response = await fetch('http://localhost:3001/api/loan-transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save transaction');
      }
      
      await fetchTransactions();
      setShowTransactionModal(false);
      setEditingTransaction(null);
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Failed to save transaction. Please try again.');
    }
  };

  const handleDeleteTransaction = async (transactionId: number) => {
    if (window.confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      try {
        // Note: API doesn't support DELETE yet, so we'll show a message
        alert('Delete functionality is not yet implemented in the API. Please contact support.');
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Failed to delete transaction. Please try again.');
      }
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.borrower_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBorrower = filterBorrower === 'all' || 
                           transaction.borrower_id.toString() === filterBorrower;
    
    const matchesType = filterType === 'all' || 
                       (filterType === 'lent' && transaction.amount > 0) ||
                       (filterType === 'received' && transaction.amount < 0);
    
    return matchesSearch && matchesBorrower && matchesType;
  });

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading transactions...</div>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <div className="card__header">
          <div className="transaction-filters">
            <input
              type="text"
              className="form-control"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="form-control"
              value={filterBorrower}
              onChange={(e) => setFilterBorrower(e.target.value)}
            >
              <option value="all">All Borrowers</option>
              {borrowers.map(borrower => (
                <option key={borrower.id} value={borrower.id.toString()}>
                  {borrower.name}
                </option>
              ))}
            </select>
            <select
              className="form-control"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'lent' | 'received')}
            >
              <option value="all">All Types</option>
              <option value="lent">Money Lent</option>
              <option value="received">Money Received</option>
            </select>
            <button 
              className="btn btn--primary"
              onClick={handleAddTransaction}
            >
              + Add Transaction
            </button>
          </div>
        </div>
        <div className="card__body">
          <div className="transaction-list">
            {filteredTransactions.length === 0 ? (
              <div className="empty-state">
                <p>No transactions found.</p>
                <button 
                  className="btn btn--primary"
                  onClick={handleAddTransaction}
                >
                  Add Your First Transaction
                </button>
              </div>
            ) : (
              <div className="transaction-table-wrapper">
                <table className="transaction-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Borrower</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Interest Rate</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map(transaction => {
                      const isLent = transaction.amount > 0;
                      const borrower = borrowers.find(b => b.id === transaction.borrower_id);
                      const transactionDate = new Date(transaction.transaction_date);
                      
                      return (
                        <tr key={transaction.id}>
                          <td>
                            <div className="transaction-date">
                              {transactionDate.toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                          </td>
                          <td>
                            <div className="borrower-info">
                              <span className="borrower-name">{borrower?.name || 'Unknown'}</span>
                              {borrower?.contact && (
                                <span className="borrower-contact">{borrower.contact}</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className={`transaction-type ${isLent ? 'expense-type' : 'income-type'}`}>
                              {isLent ? 'Lent' : 'Received'}
                            </span>
                          </td>
                          <td>
                            <div className={`amount ${isLent ? 'expense-amount' : 'income-amount'}`}>
                              ₹{Math.abs(transaction.amount).toLocaleString()}
                            </div>
                          </td>
                          <td>
                            <span className="interest-rate">
                              {transaction.interest_rate || 0}%
                            </span>
                          </td>
                          <td>
                            <span className="transaction-description">
                              {transaction.description || 'No description'}
                            </span>
                          </td>
                          <td>
                            <div className="transaction-actions">
                              <button 
                                className="btn btn--small btn--secondary"
                                onClick={() => handleEditTransaction(transaction)}
                                title="Edit transaction"
                              >
                                Edit
                              </button>
                              <button 
                                className="btn btn--small btn--outline"
                                onClick={() => handleDeleteTransaction(transaction.id)}
                                title="Delete transaction"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
      {showTransactionModal && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingTransaction ? 'Edit Transaction' : 'Add Transaction'}</h3>
              <button className="modal-close" onClick={() => setShowTransactionModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const transactionData = {
                  borrower_id: parseInt(formData.get('borrower_id') as string),
                  type: formData.get('type') as string,
                  amount: parseFloat(formData.get('amount') as string),
                  interest_rate: parseFloat(formData.get('interest_rate') as string) || 0,
                  date: formData.get('date') as string,
                  due_date: formData.get('due_date') as string || null,
                  description: formData.get('description') as string || (formData.get('type') === 'given' ? 'Money Given' : 'Money Received')
                };
                handleSaveTransaction(transactionData);
              }}>
                <div className="form-group">
                  <label className="form-label">Transaction Type</label>
                  <div className="transaction-type-toggle">
                    <input 
                      type="radio" 
                      id="lentType" 
                      name="type" 
                      value="given" 
                      defaultChecked={!editingTransaction || editingTransaction.amount > 0}
                    />
                    <label htmlFor="lentType" className="expense-label">Money Lent</label>
                    <input 
                      type="radio" 
                      id="receivedType" 
                      name="type" 
                      value="received"
                      defaultChecked={!!(editingTransaction && editingTransaction.amount < 0)}
                    />
                    <label htmlFor="receivedType" className="income-label">Money Received</label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Borrower</label>
                  <select 
                    className="form-control" 
                    name="borrower_id" 
                    required
                    defaultValue={editingTransaction?.borrower_id || ''}
                  >
                    <option value="">Select a borrower</option>
                    {borrowers.map(borrower => (
                      <option key={borrower.id} value={borrower.id}>
                        {borrower.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Amount</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    name="amount"
                    placeholder="0.00" 
                    step="0.01" 
                    min="0.01"
                    defaultValue={editingTransaction ? Math.abs(editingTransaction.amount) : ''}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Interest Rate (% per year)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    name="interest_rate"
                    placeholder="12.0" 
                    step="0.1" 
                    min="0"
                    defaultValue={editingTransaction?.interest_rate || 0}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    name="date"
                    defaultValue={editingTransaction ? editingTransaction.transaction_date.split('T')[0] : new Date().toISOString().split('T')[0]}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Due Date (Optional)</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    name="due_date"
                    defaultValue={editingTransaction?.due_date ? editingTransaction.due_date.split('T')[0] : ''}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="description"
                    placeholder="Enter description"
                    defaultValue={editingTransaction?.description || ''}
                  />
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn btn--outline"
                    onClick={() => setShowTransactionModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn--primary"
                  >
                    {editingTransaction ? 'Update Transaction' : 'Save Transaction'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};