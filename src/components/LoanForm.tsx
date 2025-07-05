import React, { useState } from 'react';
import { Loan, Contact } from '../types';

interface LoanFormProps {
  contacts: Contact[];
  onSubmit: (loan: Omit<Loan, 'id' | 'created_at' | 'contact_name'>) => void;
  onCancel: () => void;
}

export const LoanForm: React.FC<LoanFormProps> = ({ contacts, onSubmit, onCancel }) => {
  // Ensure contacts is always an array
  const contactsArray = Array.isArray(contacts) ? contacts : [];

  const [formData, setFormData] = useState({
    contact_id: '',
    amount: '',
    interest_rate: '',
    interest_type: 'simple' as 'simple' | 'compound',
    start_date: new Date().toISOString().split('T')[0],
    due_date: '',
    status: 'active' as 'active' | 'paid' | 'defaulted',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      contact_id: parseInt(formData.contact_id),
      amount: parseFloat(formData.amount),
      interest_rate: parseFloat(formData.interest_rate),
      interest_type: formData.interest_type,
      start_date: formData.start_date,
      due_date: formData.due_date || undefined,
      status: formData.status,
      notes: formData.notes || undefined
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Create New Loan</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="contact_id">Borrower *</label>
            <select
              id="contact_id"
              name="contact_id"
              value={formData.contact_id}
              onChange={handleChange}
              required
            >
              <option value="">Select a contact</option>
              {contactsArray.map(contact => (
                <option key={contact.id} value={contact.id}>
                  {contact.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="amount">Loan Amount *</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="interest_rate">Interest Rate (%) *</label>
            <input
              type="number"
              id="interest_rate"
              name="interest_rate"
              value={formData.interest_rate}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="interest_type">Interest Type</label>
            <select
              id="interest_type"
              name="interest_type"
              value={formData.interest_type}
              onChange={handleChange}
            >
              <option value="simple">Simple Interest</option>
              <option value="compound">Compound Interest</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="start_date">Start Date *</label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="due_date">Due Date</label>
            <input
              type="date"
              id="due_date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="form-buttons">
            <button type="submit" className="btn btn-primary">Create Loan</button>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};