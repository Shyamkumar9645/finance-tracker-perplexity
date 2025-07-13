import React, { useState, useEffect } from 'react';
import { Borrower } from '../types';

interface BorrowerModalProps {
  isOpen: boolean;
  onClose: () => void;
  borrower?: Borrower | null;
  onSave: (borrower: Borrower) => void;
}

export const BorrowerModal: React.FC<BorrowerModalProps> = ({
  isOpen,
  onClose,
  borrower,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (borrower) {
      setFormData({
        name: borrower.name || '',
        contact: borrower.contact || '',
        notes: borrower.notes || ''
      });
    } else {
      setFormData({
        name: '',
        contact: '',
        notes: ''
      });
    }
    setErrors({});
  }, [borrower, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const url = borrower ? `http://localhost:3001/api/borrowers/${borrower.id}` : 'http://localhost:3001/api/borrowers';
      const method = borrower ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save borrower');
      }

      const savedBorrower = await response.json();
      onSave(savedBorrower);
      onClose();
    } catch (error) {
      console.error('Error saving borrower:', error);
      setErrors({ submit: 'Failed to save borrower. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (!isOpen) {
    return null;
  }
  
  return (
    <div className="modal active">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{borrower ? 'Edit Borrower' : 'Add New Borrower'}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Name *</label>
              <input
                type="text"
                className={`form-control ${errors.name ? 'error' : ''}`}
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="contact">Contact Info</label>
              <input
                type="text"
                className="form-control"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="Email or phone"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="notes">Notes</label>
              <textarea
                className="form-control"
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
              />
            </div>
            
            {errors.submit && <div className="error-message">{errors.submit}</div>}
            
            <div className="modal-actions">
              <button type="button" className="btn btn--outline" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : (borrower ? 'Update Borrower' : 'Add Borrower')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};