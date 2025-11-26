import React from 'react';
import './Invoice.css';

const Invoice = ({ order, user }) => {
  const PRICE_PER_LITER = 2.00; // Updated to R2.00

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-ZA', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-ZA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Generate invoice number based on date and order ID
  const invoiceNumber = `INV-${new Date().getFullYear()}${order._id.substr(-6)}`;

  return (
    <div className="invoice-container" id="invoice-container">
      <div className="invoice-header">
        <div className="logo">
          <h1>Amanzi Ordering System</h1>
          <p>NWU Mahikeng Campus</p>
        </div>
        <div className="invoice-info">
          <h2>INVOICE</h2>
          <table>
            <tbody>
              <tr>
                <td>Invoice #:</td>
                <td>{invoiceNumber}</td>
              </tr>
              <tr>
                <td>Date:</td>
                <td>{formatDate(order.orderDate || new Date())}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="invoice-addresses">
        <div className="from">
          <h3>FROM</h3>
          <p>Amanzi Ordering System</p>
          <p>NWU Mahikeng Campus</p>
          <p>North West, South Africa</p>
          <p>Email: amanzi@support.com</p>
        </div>
        <div className="to">
          <h3>TO</h3>
          <p>{user?.name || 'Customer'}</p>
          <p>{order.location}</p>
          <p>NWU Mahikeng Campus</p>
          <p>Email: {user?.email || 'customer@example.com'}</p>
        </div>
      </div>

      {/* Provider Information Section */}
      {order.providerId && (
        <div className="invoice-provider">
          <h3>SERVICE PROVIDER</h3>
          <div className="provider-details">
            <p><strong>Name:</strong> {order.providerId.name}</p>
            <p><strong>Email:</strong> {order.providerId.email}</p>
            {order.providerId.phone && (
              <p><strong>Phone:</strong> {order.providerId.phone}</p>
            )}
          </div>
          <p className="provider-note">
            <em>Please contact the service provider using the details above for delivery coordination.</em>
          </p>
        </div>
      )}

      <div className="invoice-items">
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Purified Water</td>
              <td>{order.quantity} Liters</td>
              <td>R{PRICE_PER_LITER.toFixed(2)}</td>
              <td>R{order.totalPrice.toFixed(2)}</td>
            </tr>
            <tr className="total">
              <td colSpan="3">Total</td>
              <td>R{order.totalPrice.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="invoice-notes">
        <h3>DELIVERY INFORMATION</h3>
        <p>Delivery Location: {order.location}</p>
        <p>Delivery Slot: {order.deliverySlot}</p>
        <p>Payment Method: <strong>{order.paymentMethod === 'card' ? 'Card Payment' : 'Cash on Delivery'}</strong></p>
      </div>

      <div className="invoice-footer">
        <p>Thank you for your order!</p>
        <p>For any queries, please contact amanzi@support.com</p>
      </div>
    </div>
  );
};

export default Invoice;