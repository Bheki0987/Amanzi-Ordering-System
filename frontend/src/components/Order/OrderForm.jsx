import React, { useState, useEffect } from 'react';
import { createOrder } from '../../services/orderService';
import './OrderForm.css';

const PRICE_PER_LITER = 4; // R4 per liter
const RESIDENCES = [
  'Cluster 8', 'C9', 'C10', 'C11', 'C12', 'C13', 
  'Bus Terminal', 'Nelson Mandela Res', 'Dr James Moroka', 
  'Kgosi Dick', 'A2_F', 'A5', 'Boss-Mike', 
  'Steve Bhiko House', 'Lost City', 'Khayelitsha', 'Hopeville'
];
const DELIVERY_SLOTS = [
  '10:00-12:00',
  '18:00-22:00'
];

const OrderForm = ({ onOrderSubmit, submitting, setSuccess, setError }) => {
  const [quantity, setQuantity] = useState(10);
  const [residence, setResidence] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('');
  const [totalPrice, setTotalPrice] = useState(40); // Default 10L * R4
  const [loading, setLoading] = useState(false);

  // Calculate total price whenever quantity changes
  useEffect(() => {
    setTotalPrice(quantity * PRICE_PER_LITER);
  }, [quantity]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    
    try {
      const orderData = {
        quantity,
        residence,
        deliverySlot,
        totalPrice
      };
      
      // Submit order to backend
      const response = await createOrder(orderData);
      
      // Clear form
      setQuantity(10);
      setResidence('');
      setDeliverySlot('');
      
      // Show success message
      setSuccess('Order placed successfully!');
      
      // If parent component has onOrderSubmit callback
      if (onOrderSubmit) {
        onOrderSubmit(response.data);
      }
      
      setLoading(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to place order');
      setLoading(false);
    }
  };

  return (
    <div className="order-form-container">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Water Quantity (Liters)</label>
          <input
            type="number"
            className="form-control"
            min="5"
            max="100"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
          />
          <div className="price-display">Price: R{totalPrice.toFixed(2)}</div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Residence</label>
          <select 
            className="form-control"
            value={residence}
            onChange={(e) => setResidence(e.target.value)}
            required
          >
            <option value="">Select Residence</option>
            {RESIDENCES.map((res) => (
              <option key={res} value={res}>{res}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label">Delivery Slot</label>
          <select
            className="form-control"
            value={deliverySlot}
            onChange={(e) => setDeliverySlot(e.target.value)}
            required
          >
            <option value="">Select Delivery Slot</option>
            {DELIVERY_SLOTS.map((slot) => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
        </div>
        
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="summary-item">
            <span>Water Quantity:</span>
            <span>{quantity} Liters</span>
          </div>
          <div className="summary-item">
            <span>Price per Liter:</span>
            <span>R{PRICE_PER_LITER.toFixed(2)}</span>
          </div>
          <div className="summary-item total">
            <span>Total Price:</span>
            <span>R{totalPrice.toFixed(2)}</span>
          </div>
        </div>
        
        <button 
          type="submit" 
          className="submit-btn" 
          disabled={loading || submitting}
        >
          {loading || submitting ? 'Placing Order...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
};

export default OrderForm;