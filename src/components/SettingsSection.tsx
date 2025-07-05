import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

interface Settings {
  currency: string;
  dateFormat: string;
}

export const SettingsSection: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY'
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('financeTrackerSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  };

  const handleSettingChange = (key: keyof Settings, value: string) => {
    const newSettings = {
      ...settings,
      [key]: value
    };
    setSettings(newSettings);
    // Save to localStorage immediately
    localStorage.setItem('financeTrackerSettings', JSON.stringify(newSettings));
  };

  const backupData = async () => {
    try {
      // Show loading state
      const button = document.getElementById('backupDataBtn') as HTMLButtonElement;
      const originalText = button.textContent;
      button.textContent = 'Creating Backup...';
      button.disabled = true;

      // Fetch all data from the database
      const [transactions, categories] = await Promise.all([
        api.getTransactions(),
        api.getCategories()
      ]);
      
      const data = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        settings,
        transactions,
        categories
      };
      
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `finance-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Reset button
      button.textContent = originalText;
      button.disabled = false;
      
      alert(`Backup created successfully! Downloaded ${transactions.length} transactions and ${categories.length} categories.`);
    } catch (error) {
      console.error('Error backing up data:', error);
      alert('Error creating backup. Please try again.');
      
      // Reset button on error
      const button = document.getElementById('backupDataBtn') as HTMLButtonElement;
      button.textContent = 'Backup Data';
      button.disabled = false;
    }
  };

  const restoreData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const button = document.getElementById('restoreDataBtn') as HTMLButtonElement;
        const originalText = button.textContent;
        button.textContent = 'Restoring...';
        button.disabled = true;

        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            
            // Validate backup file structure
            if (!data.transactions || !data.categories || !Array.isArray(data.transactions) || !Array.isArray(data.categories)) {
              alert('Invalid backup file format. Please select a valid backup file.');
              button.textContent = originalText;
              button.disabled = false;
              return;
            }

            // Confirm restore operation
            if (!window.confirm(`This will replace all existing data with the backup data.\n\nBackup contains:\n- ${data.transactions.length} transactions\n- ${data.categories.length} categories\n\nAre you sure you want to continue?`)) {
              button.textContent = originalText;
              button.disabled = false;
              return;
            }

            let restoredTransactions = 0;
            let restoredCategories = 0;

            // Restore categories first (transactions depend on them)
            for (const category of data.categories) {
              try {
                await api.createCategory({
                  name: category.name,
                  icon: category.icon || '📝',
                  color: category.color || '#6b7280',
                  budget_limit: category.budget_limit || category.budgetLimit || 0,
                  type: category.type || 'expense'
                });
                restoredCategories++;
              } catch (error) {
                console.warn('Error restoring category:', category.name, error);
              }
            }

            // Restore transactions
            for (const transaction of data.transactions) {
              try {
                await api.createTransaction({
                  type: transaction.type,
                  amount: parseFloat(transaction.amount),
                  category: transaction.category,
                  description: transaction.description || '',
                  payment_method: transaction.payment_method || transaction.paymentMethod || 'Cash',
                  transaction_date: transaction.transaction_date || transaction.date
                });
                restoredTransactions++;
              } catch (error) {
                console.warn('Error restoring transaction:', transaction.id, error);
              }
            }

            // Restore settings if available
            if (data.settings) {
              setSettings(data.settings);
              localStorage.setItem('financeTrackerSettings', JSON.stringify(data.settings));
            }

            button.textContent = originalText;
            button.disabled = false;
            
            alert(`Data restored successfully!\n\nRestored:\n- ${restoredCategories} categories\n- ${restoredTransactions} transactions\n\nPlease refresh the page to see the restored data.`);
            
            // Trigger refresh of dashboard and other components
            if ((window as any).refreshDashboard) {
              (window as any).refreshDashboard();
            }
            if ((window as any).refreshBudgets) {
              (window as any).refreshBudgets();
            }
          } catch (error) {
            console.error('Error restoring data:', error);
            alert('Error restoring data. Please check the file format and try again.');
            button.textContent = originalText;
            button.disabled = false;
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const clearData = async () => {
    if (!window.confirm('Are you sure you want to clear all data? This will permanently delete:\n\n• All transactions\n• All categories\n• All settings\n\nThis action cannot be undone!')) {
      return;
    }

    // Double confirmation for safety
    if (!window.confirm('This is your final warning. All data will be permanently deleted. Are you absolutely sure?')) {
      return;
    }

    try {
      const button = document.getElementById('clearDataBtn') as HTMLButtonElement;
      const originalText = button.textContent;
      button.textContent = 'Clearing Data...';
      button.disabled = true;

      // Get all data to delete
      const [transactions, categories] = await Promise.all([
        api.getTransactions(),
        api.getCategories()
      ]);

      let deletedTransactions = 0;
      let deletedCategories = 0;

      // Delete all transactions
      for (const transaction of transactions) {
        try {
          await api.deleteTransaction(transaction.id);
          deletedTransactions++;
        } catch (error) {
          console.warn('Error deleting transaction:', transaction.id, error);
        }
      }

      // Delete all categories
      for (const category of categories) {
        try {
          await api.deleteCategory(category.id);
          deletedCategories++;
        } catch (error) {
          console.warn('Error deleting category:', category.id, error);
        }
      }

      // Clear local settings
      localStorage.removeItem('financeTrackerSettings');
      setSettings({
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY'
      });

      button.textContent = originalText;
      button.disabled = false;

      alert(`All data has been cleared!\n\nDeleted:\n- ${deletedTransactions} transactions\n- ${deletedCategories} categories\n- All settings\n\nThe page will now refresh.`);
      
      // Refresh the page to reset the UI
      window.location.reload();
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('Error clearing data. Please try again.');
      
      const button = document.getElementById('clearDataBtn') as HTMLButtonElement;
      button.textContent = 'Clear All Data';
      button.disabled = false;
    }
  };

  return (
    <section className="content-section active" id="settings">
      <div className="settings-content">
        <div className="card">
          <div className="card__header">
            <h3>General Settings</h3>
          </div>
          <div className="card__body">
            <div className="form-group">
              <label className="form-label">Default Currency</label>
              <select 
                className="form-control" 
                id="currencySelect"
                value={settings.currency}
                onChange={(e) => handleSettingChange('currency', e.target.value)}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date Format</label>
              <select 
                className="form-control" 
                id="dateFormatSelect"
                value={settings.dateFormat}
                onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card__header">
            <h3>Data Management</h3>
          </div>
          <div className="card__body">
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <button className="btn btn--secondary" id="backupDataBtn" onClick={backupData}>
                Backup Data
              </button>
              <button className="btn btn--outline" id="restoreDataBtn" onClick={restoreData}>
                Restore Data
              </button>
              <button className="btn btn--outline" id="clearDataBtn" onClick={clearData} style={{ color: '#ef4444', borderColor: '#ef4444' }}>
                Clear All Data
              </button>
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
              <p><strong>Backup:</strong> Download all your transactions, categories, and settings as a JSON file.</p>
              <p><strong>Restore:</strong> Upload a backup file to restore your data. This will add to existing data.</p>
              <p><strong>Clear:</strong> Permanently delete all data from the database. This cannot be undone.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};