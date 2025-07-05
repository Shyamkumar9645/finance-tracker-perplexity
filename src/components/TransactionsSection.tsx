import React, { useState, useEffect } from 'react';
import { Transaction, Category } from '../types';
import { api } from '../utils/api';

interface TransactionsSectionProps {
  onAddTransaction?: () => void;
}

export const TransactionsSection: React.FC<TransactionsSectionProps> = ({ onAddTransaction }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [transactionsData, categoriesData] = await Promise.all([
        api.getTransactions(),
        api.getCategories()
      ]);
      setTransactions(transactionsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || transaction.category === categoryFilter;
    const matchesType = !typeFilter || transaction.type === typeFilter;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleEdit = (transaction: Transaction) => {
    console.log('Edit transaction:', transaction);
    // TODO: Open edit modal with transaction data
  };

  const handleDelete = async (transactionId: number) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.deleteTransaction(transactionId);
        await loadData(); // Refresh the list
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Failed to delete transaction. Please try again.');
      }
    }
  };

  // Add this function to handle the refresh after a new transaction is added
  const refreshTransactions = () => {
    loadData();
  };

  // Expose this function so parent components can call it
  React.useEffect(() => {
    // Store the refresh function on the window object so it can be called from App.tsx
    (window as any).refreshTransactions = refreshTransactions;
    
    return () => {
      delete (window as any).refreshTransactions;
    };
  }, []);

  if (loading) {
    return (
      <section className="content-section active" id="transactions">
        <div className="loading">Loading transactions...</div>
      </section>
    );
  }

  return (
    <section className="content-section active" id="transactions">
      <div className="card">
        <div className="card__header">
          <div className="transaction-filters">
            <input 
              type="text" 
              className="form-control" 
              id="searchTransactions" 
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              className="form-control" 
              id="filterCategory"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
            <select 
              className="form-control" 
              id="filterType"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
        </div>
        <div className="card__body">
          <div className="transaction-list" id="transactionList">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map(transaction => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-info">
                    <div className="transaction-category">
                      {transaction.category}
                    </div>
                    <div className="transaction-description">
                      {transaction.description || 'No description'}
                    </div>
                  </div>
                  <div className="transaction-date">
                    {formatDate(transaction.transaction_date)}
                  </div>
                  <div className={`transaction-amount ${transaction.type}`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                  </div>
                  <div className="transaction-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => handleEdit(transaction)}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(transaction.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">💳</div>
                <h3>No transactions found</h3>
                <p>
                  {searchTerm || categoryFilter || typeFilter 
                    ? 'Try adjusting your search filters or add your first transaction.'
                    : 'Add your first transaction to get started.'
                  }
                </p>
                <button 
                  className="btn btn--primary"
                  onClick={onAddTransaction}
                >
                  + Add Transaction
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};