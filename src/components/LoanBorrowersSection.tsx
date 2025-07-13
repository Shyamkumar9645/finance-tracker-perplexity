import React, { useState, useEffect } from 'react';
import { Borrower } from '../types';
import { BorrowerCard } from './BorrowerCard';

interface LoanBorrowersSectionProps {
  onAddBorrower: () => void;
}

export const LoanBorrowersSection: React.FC<LoanBorrowersSectionProps> = ({ 
  onAddBorrower 
}) => {
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'settled'>('all');
  const [showBorrowerModal, setShowBorrowerModal] = useState(false);
  const [editingBorrower, setEditingBorrower] = useState<Borrower | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBorrowers();
  }, []);

  const fetchBorrowers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:3001/api/borrowers');
      const data = await response.json();
      setBorrowers(data);
    } catch (error) {
      console.error('Error fetching borrowers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBorrower = () => {
    setEditingBorrower(null);
    setShowBorrowerModal(true);
  };

  const handleEditBorrower = (borrower: Borrower) => {
    setEditingBorrower(borrower);
    setShowBorrowerModal(true);
  };

  const handleSaveBorrower = async (borrowerData: Borrower) => {
    try {
      if (editingBorrower) {
        // Update existing borrower
        const response = await fetch(`http://localhost:3001/api/borrowers/${editingBorrower.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: borrowerData.name,
            contact: borrowerData.contact,
            notes: borrowerData.notes
          })
        });
        if (response.ok) {
          await fetchBorrowers();
        }
      } else {
        // Create new borrower
        const response = await fetch('http://localhost:3001/api/borrowers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: borrowerData.name,
            contact: borrowerData.contact,
            notes: borrowerData.notes
          })
        });
        if (response.ok) {
          await fetchBorrowers();
        }
      }
      setShowBorrowerModal(false);
      setEditingBorrower(null);
    } catch (error) {
      console.error('Error saving borrower:', error);
    }
  };

  const handleDeleteBorrower = async (borrowerId: number) => {
    if (window.confirm('Are you sure you want to delete this borrower? This will also delete all associated transactions.')) {
      try {
        const response = await fetch(`http://localhost:3001/api/borrowers/${borrowerId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          await fetchBorrowers();
        }
      } catch (error) {
        console.error('Error deleting borrower:', error);
      }
    }
  };

  const filteredBorrowers = borrowers.filter(borrower => {
    const matchesSearch = borrower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (borrower.contact && borrower.contact.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && borrower.outstanding > 0) ||
                         (filterStatus === 'settled' && borrower.outstanding === 0);
    
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading borrowers...</div>
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
              placeholder="Search borrowers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              className="form-control" 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'settled')}
            >
              <option value="all">All Borrowers</option>
              <option value="active">Active (Outstanding &gt; 0)</option>
              <option value="settled">Settled (Outstanding = 0)</option>
            </select>
            <button 
              className="btn btn--primary"
              onClick={handleAddBorrower}
            >
              + Add Borrower
            </button>
          </div>
        </div>
        <div className="card__body">
          <div className="borrower-list">
            {filteredBorrowers.length === 0 ? (
              <div className="empty-state">
                <p>No borrowers found.</p>
                <button 
                  className="btn btn--primary"
                  onClick={handleAddBorrower}
                >
                  Add Your First Borrower
                </button>
              </div>
            ) : (
              <div className="borrower-grid">
                {filteredBorrowers.map(borrower => {
                  const status = borrower.outstanding > 0 ? 'current' : 'pending';
                  return (
                    <BorrowerCard
                      key={borrower.id}
                      borrower={borrower}
                      status={status}
                      onClick={() => handleEditBorrower(borrower)}
                      formatCurrency={(amount) => `₹${amount.toLocaleString()}`}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Borrower Modal */}
      {showBorrowerModal && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingBorrower ? 'Edit Borrower' : 'Add Borrower'}</h3>
              <button className="modal-close" onClick={() => setShowBorrowerModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const borrowerData = {
                  name: formData.get('name') as string,
                  contact: formData.get('contact') as string,
                  notes: formData.get('notes') as string
                };
                handleSaveBorrower(borrowerData as any);
              }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="name"
                    placeholder="Enter borrower's full name"
                    defaultValue={editingBorrower?.name || ''}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Information</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="contact"
                    placeholder="Phone number or email address"
                    defaultValue={editingBorrower?.contact || ''}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea 
                    className="form-control" 
                    name="notes"
                    rows={4}
                    placeholder="Additional notes about the borrower"
                    defaultValue={editingBorrower?.notes || ''}
                  />
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn btn--outline"
                    onClick={() => setShowBorrowerModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn--primary"
                  >
                    {editingBorrower ? 'Update Borrower' : 'Save Borrower'}
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