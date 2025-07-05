import React, { useState } from 'react';

interface Settings {
  currency: string;
  dateFormat: string;
  theme: 'light' | 'dark';
  notifications: boolean;
  exportFormat: string;
  budgetAlerts: boolean;
  overdueReminders: boolean;
}

export const SettingsSection: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    theme: 'light',
    notifications: true,
    exportFormat: 'PDF',
    budgetAlerts: true,
    overdueReminders: true
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSettingChange = (key: keyof Settings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    // Mock save operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('Settings saved successfully!');
  };

  const backupData = () => {
    alert('Data backup feature would be implemented here');
  };

  const restoreData = () => {
    alert('Data restore feature would be implemented here');
  };

  const clearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      alert('Data clear feature would be implemented here');
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
                <option value="JPY">JPY (¥)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="AUD">AUD (A$)</option>
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
                <option value="DD-MM-YYYY">DD-MM-YYYY</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Theme</label>
              <select 
                className="form-control"
                value={settings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value as 'light' | 'dark')}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Default Export Format</label>
              <select 
                className="form-control"
                value={settings.exportFormat}
                onChange={(e) => handleSettingChange('exportFormat', e.target.value)}
              >
                <option value="PDF">PDF</option>
                <option value="Excel">Excel (XLSX)</option>
                <option value="CSV">CSV</option>
                <option value="JSON">JSON</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card__header">
            <h3>Notifications & Alerts</h3>
          </div>
          <div className="card__body">
            <div className="settings-toggles">
              <div className="toggle-item">
                <div className="toggle-info">
                  <label className="form-label">Enable Notifications</label>
                  <p className="toggle-description">Receive general app notifications</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={settings.notifications}
                    onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="toggle-item">
                <div className="toggle-info">
                  <label className="form-label">Budget Alerts</label>
                  <p className="toggle-description">Get notified when approaching budget limits</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={settings.budgetAlerts}
                    onChange={(e) => handleSettingChange('budgetAlerts', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="toggle-item">
                <div className="toggle-info">
                  <label className="form-label">Overdue Reminders</label>
                  <p className="toggle-description">Receive reminders for overdue loan payments</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={settings.overdueReminders}
                    onChange={(e) => handleSettingChange('overdueReminders', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card__header">
            <h3>Data Management</h3>
          </div>
          <div className="card__body">
            <div className="data-actions">
              <button 
                className="btn btn--secondary" 
                id="backupDataBtn"
                onClick={backupData}
              >
                📦 Backup Data
              </button>
              <button 
                className="btn btn--outline" 
                id="restoreDataBtn"
                onClick={restoreData}
              >
                📥 Restore Data
              </button>
              <button 
                className="btn btn--outline danger" 
                id="clearDataBtn"
                onClick={clearData}
              >
                🗑️ Clear All Data
              </button>
            </div>
            <div className="data-info">
              <p>
                <strong>Backup:</strong> Export all your data to a secure backup file.
              </p>
              <p>
                <strong>Restore:</strong> Import data from a previous backup.
              </p>
              <p>
                <strong>Clear:</strong> Permanently delete all application data. This cannot be undone.
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card__header">
            <h3>Application Info</h3>
          </div>
          <div className="card__body">
            <div className="app-info">
              <div className="info-item">
                <span className="info-label">Version:</span>
                <span className="info-value">1.0.0</span>
              </div>
              <div className="info-item">
                <span className="info-label">Last Updated:</span>
                <span className="info-value">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Data Storage:</span>
                <span className="info-value">Supabase PostgreSQL</span>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-actions">
          <button 
            className={`btn btn--primary ${isSaving ? 'loading' : ''}`}
            onClick={saveSettings}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
          <button 
            className="btn btn--outline"
            onClick={() => window.location.reload()}
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </section>
  );
};