import React from 'react';
import './InvoiceModal.css';

const InvoiceModal = ({ order, user, onClose }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="invoice-modal-overlay">
      <div className="invoice-modal">
        <div className="invoice-header">
          <h2>Order Details</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="invoice-content">
          <div className="invoice-company">
            <h1>Amanzi Ordering System</h1>
            <p>Bringing clean water to your residence</p>
          </div>
          
          <div className="invoice-details">
            <div className="invoice-row">
              <div className="invoice-col">
                <strong>Order #:</strong> {order._id}
              </div>
              <div className="invoice-col">
                <strong>Date:</strong> {formatDate(order.orderDate)}
              </div>
            </div>
            
            <div className="invoice-row">
              <div className="invoice-col">
                <strong>Status:</strong> 
                <span className={`status-badge status-${order.status}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <div className="invoice-col">
                <strong>Delivery Slot:</strong> {order.deliverySlot}
              </div>
            </div>
          </div>
          
          <div className="invoice-customer">
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Residence:</strong> {order.residence}</p>
          </div>
          
          <div className="invoice-items">
            <h3>Order Summary</h3>
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Drinking Water</td>
                  <td>{order.quantity} Liters</td>
                  <td>R4.00 / Liter</td>
                  <td>R{order.totalPrice.toFixed(2)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="total-label">Total Amount</td>
                  <td className="total-value">R{order.totalPrice.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div className="invoice-notes">
            <p>Thank you for using Amanzi Ordering System!</p>
            <p>Your water will be delivered during your selected time slot.</p>
          </div>
        </div>
        
        <div className="invoice-actions">
          <button className="print-btn" onClick={() => window.print()}>Print Invoice</button>
          <button className="close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;