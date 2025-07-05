import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { TransactionsSection } from './components/TransactionsSection';
import { BudgetsSection } from './components/BudgetsSection';
import { CategoriesSection } from './components/CategoriesSection';
import { ReportsSection } from './components/ReportsSection';
import { SettingsSection } from './components/SettingsSection';
import { TransactionModal } from './components/TransactionModal';
import { CategoryModal } from './components/CategoryModal';
import './App.css';

type View = 'dashboard' | 'transactions' | 'budgets' | 'categories' | 'reports' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const handleAddTransaction = (transaction: any) => {
    // Handle transaction creation
    console.log('New transaction:', transaction);
    // TODO: Add to backend API
    setShowTransactionModal(false);
  };

  const handleAddCategory = (category: any) => {
    // Handle category creation
    console.log('New category:', category);
    // TODO: Add to backend API
    setShowCategoryModal(false);
  };

  const renderSidebar = () => (
    <nav className="sidebar" id="sidebar">
      <div className="sidebar-header">
        <h2>💰 Finance Tracker</h2>
      </div>
      <ul className="sidebar-menu">
        <li 
          className={`sidebar-item ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentView('dashboard')}
        >
          <span className="sidebar-icon">🏠</span>
          <span className="sidebar-text">Dashboard</span>
        </li>
        <li 
          className={`sidebar-item ${currentView === 'transactions' ? 'active' : ''}`}
          onClick={() => setCurrentView('transactions')}
        >
          <span className="sidebar-icon">💳</span>
          <span className="sidebar-text">Transactions</span>
        </li>
        <li 
          className={`sidebar-item ${currentView === 'budgets' ? 'active' : ''}`}
          onClick={() => setCurrentView('budgets')}
        >
          <span className="sidebar-icon">🎯</span>
          <span className="sidebar-text">Budgets</span>
        </li>
        <li 
          className={`sidebar-item ${currentView === 'categories' ? 'active' : ''}`}
          onClick={() => setCurrentView('categories')}
        >
          <span className="sidebar-icon">📁</span>
          <span className="sidebar-text">Categories</span>
        </li>
        <li 
          className={`sidebar-item ${currentView === 'reports' ? 'active' : ''}`}
          onClick={() => setCurrentView('reports')}
        >
          <span className="sidebar-icon">📊</span>
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
        case 'transactions': return 'Transactions';
        case 'budgets': return 'Budgets';
        case 'categories': return 'Categories';
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
              onClick={() => setShowTransactionModal(true)}
            >
              + Add Transaction
            </button>
          );
        case 'budgets':
          return (
            <button 
              className="btn btn--primary"
              id="addBudgetBtn"
            >
              + Add Budget
            </button>
          );
        case 'categories':
          return (
            <button 
              className="btn btn--primary"
              id="addCategoryBtn"
              onClick={() => setShowCategoryModal(true)}
            >
              + Add Category
            </button>
          );
        case 'reports':
          return (
            <button 
              className="btn btn--secondary"
              id="exportDataBtn"
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
              onAddTransaction={() => setShowTransactionModal(true)}
            />
          );
        
        case 'transactions':
          return <TransactionsSection onAddTransaction={() => setShowTransactionModal(true)} />;
        
        case 'budgets':
          return <BudgetsSection onAddBudget={() => alert('Budget creation feature coming soon!')} />;
        
        case 'categories':
          return <CategoriesSection onAddCategory={() => setShowCategoryModal(true)} />;
        
        case 'reports':
          return <ReportsSection />;
        
        case 'settings':
          return <SettingsSection />;
        
        default:
          return (
            <Dashboard 
              loans={[]} 
              balances={{}} 
              onAddTransaction={() => setShowTransactionModal(true)}
            />
          );
      }
    };

    return (
      <>
        {currentView !== 'dashboard' && (
          <div className="section-header">
            <h1>{getPageTitle()}</h1>
            {renderPageActions()}
          </div>
        )}
        {renderPageContent()}
      </>
    );
  };

  return (
    <div className="app-container">
      {renderSidebar()}
      <main className="main-content">
        {renderCurrentView()}
      </main>
      
      <TransactionModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        onSubmit={handleAddTransaction}
      />
      
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSubmit={handleAddCategory}
      />
    </div>
  );
}

export default App;