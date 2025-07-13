import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { TransactionsSection } from './components/TransactionsSection';
import { BudgetsSection } from './components/BudgetsSection';
import { CategoriesSection } from './components/CategoriesSection';
import { ReportsSection } from './components/ReportsSection';
import { SettingsSection } from './components/SettingsSection';
import { LoansSection } from './components/LoansSection';
import { LoanBorrowersSection } from './components/LoanBorrowersSection';
import { LoanTransactionsSection } from './components/LoanTransactionsSection';
import { TransactionModal } from './components/TransactionModal';
import { CategoryModal } from './components/CategoryModal';
import { Category, Transaction } from './types';
import './App.css';

type View = 'dashboard' | 'transactions' | 'budgets' | 'categories' | 'loans' | 'loan-borrowers' | 'loan-transactions' | 'reports' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleAddTransaction = () => {
    console.log('App: handleAddTransaction called');
    setEditingTransaction(null);
    setShowTransactionModal(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    console.log('App: handleEditTransaction called', transaction);
    setEditingTransaction(transaction);
    setShowTransactionModal(true);
  };

  const handleCloseTransactionModal = () => {
    console.log('App: handleCloseTransactionModal called');
    setShowTransactionModal(false);
    setEditingTransaction(null);
  };

  const handleAddCategory = () => {
    console.log('App: handleAddCategory called');
    setEditingCategory(null);
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: Category) => {
    console.log('App: handleEditCategory called', category);
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleCloseCategoryModal = () => {
    console.log('App: handleCloseCategoryModal called');
    setShowCategoryModal(false);
    setEditingCategory(null);
  };


  const renderSidebar = () => (
    <nav className="sidebar" id="sidebar">
      <div className="sidebar-header">
        <h2>🏦 Financial Dashboard</h2>
      </div>
      <ul className="sidebar-menu">
        <li 
          className={`sidebar-item ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentView('dashboard')}
        >
          <span className="sidebar-icon">🏠</span>
          <span className="sidebar-text">Dashboard</span>
        </li>
        
        {/* Finance Tracker Section */}
        <li className="sidebar-section-header">
          <span className="sidebar-section-title">💰 Finance Tracker</span>
        </li>
        <li 
          className={`sidebar-item finance-section ${currentView === 'transactions' ? 'active' : ''}`}
          onClick={() => setCurrentView('transactions')}
        >
          <span className="sidebar-icon">💳</span>
          <span className="sidebar-text">Transactions</span>
        </li>
        <li 
          className={`sidebar-item finance-section ${currentView === 'budgets' ? 'active' : ''}`}
          onClick={() => setCurrentView('budgets')}
        >
          <span className="sidebar-icon">🎯</span>
          <span className="sidebar-text">Budgets</span>
        </li>
        <li 
          className={`sidebar-item finance-section ${currentView === 'categories' ? 'active' : ''}`}
          onClick={() => setCurrentView('categories')}
        >
          <span className="sidebar-icon">📁</span>
          <span className="sidebar-text">Categories</span>
        </li>
        
        {/* Loan Tracker Section */}
        <li className="sidebar-section-header">
          <span className="sidebar-section-title">🤝 Loan Tracker</span>
        </li>
        <li 
          className={`sidebar-item loan-section ${currentView === 'loans' ? 'active' : ''}`}
          onClick={() => setCurrentView('loans')}
        >
          <span className="sidebar-icon">💰</span>
          <span className="sidebar-text">Loans</span>
        </li>
        <li 
          className={`sidebar-item loan-section ${currentView === 'loan-borrowers' ? 'active' : ''}`}
          onClick={() => setCurrentView('loan-borrowers')}
        >
          <span className="sidebar-icon">👥</span>
          <span className="sidebar-text">Borrowers</span>
        </li>
        <li 
          className={`sidebar-item loan-section ${currentView === 'loan-transactions' ? 'active' : ''}`}
          onClick={() => setCurrentView('loan-transactions')}
        >
          <span className="sidebar-icon">📋</span>
          <span className="sidebar-text">Loan Transactions</span>
        </li>
        
        {/* General Section */}
        <li className="sidebar-section-header">
          <span className="sidebar-section-title">📊 Analytics</span>
        </li>
        <li 
          className={`sidebar-item ${currentView === 'reports' ? 'active' : ''}`}
          onClick={() => setCurrentView('reports')}
        >
          <span className="sidebar-icon">📈</span>
          <span className="sidebar-text">Reports</span>
        </li>
        <li 
          className={`sidebar-item ${currentView === 'settings' ? 'active' : ''}`}
          onClick={() => setCurrentView('settings')}
        >
          <span className="sidebar-icon">⚙️</span>
          <span className="sidebar-text">Settings</span>
        </li>
      </ul>
    </nav>
  );

  const renderCurrentView = () => {
    const getPageTitle = () => {
      switch (currentView) {
        case 'dashboard': return 'Dashboard';
        case 'transactions': return 'Finance Tracker • Transactions';
        case 'budgets': return 'Finance Tracker • Budgets';
        case 'categories': return 'Finance Tracker • Categories';
        case 'loans': return 'Loan Tracker • Loans';
        case 'loan-borrowers': return 'Loan Tracker • Borrowers';
        case 'loan-transactions': return 'Loan Tracker • Transactions';
        case 'reports': return 'Reports & Analytics';
        case 'settings': return 'Settings';
        default: return 'Dashboard';
      }
    };

    const renderPageActions = () => {
      switch (currentView) {
        case 'transactions':
          return (
            <button 
              className="btn btn--primary"
              id="addTransactionBtn2"
              onClick={() => {
                console.log('Add Transaction button clicked!');
                handleAddTransaction();
              }}
            >
              + Add Transaction
            </button>
          );
        case 'budgets':
          return (
            <button 
              className="btn btn--primary"
              id="addBudgetBtn"
              onClick={() => setCurrentView('categories')}
            >
              + Add Budget
            </button>
          );
        case 'categories':
          return (
            <button 
              className="btn btn--primary"
              id="addCategoryBtn"
              onClick={() => {
                console.log('Add Category button clicked!');
                handleAddCategory();
              }}
            >
              + Add Category
            </button>
          );
        case 'loan-borrowers':
          return null; // Handled by the component itself
        case 'loan-transactions':
          return null; // Handled by the component itself
        case 'reports':
          return (
            <button 
              className="btn btn--secondary"
              id="exportDataBtn"
              onClick={() => {
                // Trigger export from ReportsSection
                const exportEvent = new CustomEvent('export-data');
                document.dispatchEvent(exportEvent);
              }}
            >
              Export Data
            </button>
          );
        default:
          return null;
      }
    };

    const renderPageContent = () => {
      switch (currentView) {
        case 'dashboard':
          return (
            <Dashboard 
              loans={[]} 
              balances={{}} 
              onAddTransaction={handleAddTransaction}
            />
          );
        
        case 'transactions':
          return <TransactionsSection onAddTransaction={handleAddTransaction} onEditTransaction={handleEditTransaction} />;
        
        case 'budgets':
          return (
            <BudgetsSection 
              onAddBudget={() => setCurrentView('categories')}
            />
          );
        
        case 'categories':
          return (
            <CategoriesSection 
              onAddCategory={() => setShowCategoryModal(true)}
              onEditCategory={handleEditCategory}
            />
          );
        
        case 'loans':
          return (
            <LoansSection 
              onAddBorrower={() => {}}
              onAddTransaction={() => {}}
            />
          );
        
        case 'loan-borrowers':
          return (
            <LoanBorrowersSection 
              onAddBorrower={() => {}}
            />
          );
        
        case 'loan-transactions':
          return (
            <LoanTransactionsSection 
              onAddTransaction={() => {}}
            />
          );
        
        case 'reports':
          return <ReportsSection />;
        
        case 'settings':
          return <SettingsSection />;
        
        default:
          return (
            <Dashboard 
              loans={[]} 
              balances={{}} 
              onAddTransaction={handleAddTransaction}
            />
          );
      }
    };

    const getSectionClass = () => {
      switch (currentView) {
        case 'transactions':
        case 'budgets':
        case 'categories':
          return 'section-header finance-section-header';
        case 'loans':
        case 'loan-borrowers':
        case 'loan-transactions':
          return 'section-header loan-section-header';
        default:
          return 'section-header';
      }
    };

    return (
      <>
        {currentView !== 'dashboard' && (
          <div className={getSectionClass()}>
            <h1>{getPageTitle()}</h1>
            {renderPageActions()}
          </div>
        )}
        {renderPageContent()}
      </>
    );
  };

  console.log('App render: showTransactionModal:', showTransactionModal, 'showCategoryModal:', showCategoryModal);

  return (
    <div className="app-container">
      {renderSidebar()}
      <main className="main-content">
        {renderCurrentView()}
      </main>
      
      <TransactionModal
        isOpen={showTransactionModal}
        onClose={handleCloseTransactionModal}
        transaction={editingTransaction}
      />
      
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={handleCloseCategoryModal}
        category={editingCategory}
      />
      
    </div>
  );
}

export default App;