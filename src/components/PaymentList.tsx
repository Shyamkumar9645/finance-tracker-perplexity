import React from 'react';
import { Payment } from '../types';

interface PaymentListProps {
  payments: Payment[];
  loanId: number;
}

export const PaymentList: React.FC<PaymentListProps> = ({ payments, loanId }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPaymentMethod = (method: string) => {
    return method.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="payment-list">
      <div className="payment-header">
        <h3>Payment History</h3>
        <div className="payment-summary">
          <p><strong>Total Paid:</strong> {formatCurrency(totalPaid)}</p>
          <p><strong>Number of Payments:</strong> {payments.length}</p>
        </div>
      </div>
      
      {payments.length === 0 ? (
        <p>No payments recorded yet.</p>
      ) : (
        <div className="payment-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.id}>
                  <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                  <td>{formatCurrency(payment.amount)}</td>
                  <td>{payment.payment_method ? formatPaymentMethod(payment.payment_method) : 'N/A'}</td>
                  <td>{payment.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};