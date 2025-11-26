import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../../services/orderService';
import { getProviders } from '../../services/providerService';
import './OrderForm.css';

const PRICE_PER_LITER = 2.00;
const MINIMUM_ORDER_QUANTITY = 5;
const RESIDENCES = [
  'Cluster 8', 'C9', 'C10', 'C11', 'C12', 'C13', 
  'Bus Terminal', 'Nelson Mandela Res', 'Dr James Moroka', 
  'Kgosi Dick', 'A2_F', 'A5', 'Boss-Mike', 
  'Steve Bhiko House', 'Lost City', 'Khayelitsha', 'Hopeville'
];
const DELIVERY_SLOTS = ['10:00-12:00', '18:00-22:00'];

const OrderForm = ({ onOrderSubmit, setSuccess, setError }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    quantity: MINIMUM_ORDER_QUANTITY,
    residence: '',
    deliverySlot: '',
    providerId: '',
    paymentMethod: 'cash_on_delivery',
    specialInstructions: ''
  });
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingProviders, setFetchingProviders] = useState(true);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    fetchProviders();
    
    // ✅ AUTO-REFRESH every 30 seconds to check provider availability
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing provider list...');
      fetchProviders();
    }, 30000); // 30 seconds
    
    // ✅ Cleanup on unmount
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchProviders = async () => {
    try {
      setFetchingProviders(true);
      setLocalError('');
      console.log('🔄 Fetching available providers...'); // ✅ Debug log
      
      const data = await getProviders(); // ✅ This now calls /available endpoint
      console.log('📦 Providers data received:', data); // ✅ Debug log
      
      // ✅ Backend already filtered, just use the array
      const providersArray = Array.isArray(data) ? data : [];
      
      console.log(`✅ Found ${providersArray.length} available providers`); // ✅ Debug log
      
      // ✅ Log each provider's availability status
      providersArray.forEach(p => {
        console.log(`   - ${p.name}: ${p.providerDetails?.availabilityStatus || 'unknown'}`);
      });
      
      setProviders(providersArray);
      
      if (providersArray.length > 0) {
        // ✅ Only auto-select if no provider is selected
        if (!formData.providerId) {
          setFormData(prev => ({ ...prev, providerId: providersArray[0]._id }));
        }
      } else {
        setLocalError('No service providers available at the moment. Please try again later.');
        setFormData(prev => ({ ...prev, providerId: '' })); // Clear selection
      }
    } catch (error) {
      console.error('❌ Error in fetchProviders:', error);
      setLocalError('Failed to load service providers. Please refresh the page.');
      setProviders([]);
    } finally {
      setFetchingProviders(false);
    }
  };

  const calculateTotal = () => {
    const quantity = parseInt(formData.quantity) || 0;
    const total = quantity * PRICE_PER_LITER;
    return total; // Make sure this returns a number
  };

  // Get selected provider name
  const getSelectedProviderName = () => {
    const provider = providers.find(p => p._id === formData.providerId);
    return provider ? provider.name : 'Not selected';
  };

  // Get payment method display name
  const getPaymentMethodDisplay = () => {
    return formData.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Card Payment';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for quantity to enforce minimum
    if (name === 'quantity') {
      const quantityValue = parseInt(value) || MINIMUM_ORDER_QUANTITY;
      // Ensure quantity is at least 5
      setFormData(prev => ({
        ...prev,
        [name]: Math.max(MINIMUM_ORDER_QUANTITY, quantityValue)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError('');
    if (setError) setError('');

    if (!formData.quantity || !formData.residence || !formData.deliverySlot || !formData.providerId) {
      setLocalError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.paymentMethod === 'card' && formData.quantity < MINIMUM_ORDER_QUANTITY) {
      setLocalError(`For card payments, minimum order is ${MINIMUM_ORDER_QUANTITY} liters (R${(MINIMUM_ORDER_QUANTITY * PRICE_PER_LITER).toFixed(2)})`);
      setLoading(false);
      return;
    }

    try {
      const response = await createOrder(formData);
      
      if (response.success) {
        if (setSuccess) {
          setSuccess(response.message || 'Order placed successfully!');
        }

        setFormData({
          quantity: MINIMUM_ORDER_QUANTITY,
          residence: '',
          deliverySlot: '',
          providerId: providers[0]?._id || '',
          paymentMethod: 'cash_on_delivery',
          specialInstructions: ''
        });

        if (formData.paymentMethod === 'card' && response.data) {
          navigate(`/customer/payment/${response.data._id}`);
        } else {
          if (onOrderSubmit) {
            onOrderSubmit(response.data);
          }
        }
      }
    } catch (error) {
      console.error('Order submission error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to place order. Please try again.';
      setLocalError(errorMessage);
      if (setError) setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingProviders) {
    return (
      <div className="order-form-container">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner"></div>
          <p>Loading providers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-form-container">
      {localError && (
        <div className="alert alert-error">
          {localError}
        </div>
      )}

      {/* ✅ ADD REFRESH BUTTON */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        padding: '12px',
        backgroundColor: '#F3F4F6',
        borderRadius: '8px'
      }}>
        <div>
          <strong>{providers.length}</strong> provider{providers.length !== 1 ? 's' : ''} available
        </div>
        <button
          type="button"
          onClick={() => {
            console.log('Manual refresh triggered');
            fetchProviders();
          }}
          disabled={fetchingProviders}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: fetchingProviders ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}
        >
          {fetchingProviders ? (
            <>
              <span className="spinner-small"></span>
              Refreshing...
            </>
          ) : (
            <>
              🔄 Refresh Providers
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="order-form">
        <div className="form-group">
          <label htmlFor="quantity" className="form-label">
            Quantity (Liters) *
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="form-control"
            required
            min={MINIMUM_ORDER_QUANTITY}
            step="1"
            onBlur={(e) => {
              // Enforce minimum on blur
              const value = parseInt(e.target.value);
              if (!value || value < MINIMUM_ORDER_QUANTITY) {
                setFormData(prev => ({
                  ...prev,
                  quantity: MINIMUM_ORDER_QUANTITY
                }));
              }
            }}
          />
          <small className="form-text">Minimum order: {MINIMUM_ORDER_QUANTITY} liters</small>
          <div className="price-display">
            Total: R{(calculateTotal() || 0).toFixed(2)}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="residence">Residence *</label>
          <select
            id="residence"
            name="residence"
            value={formData.residence}
            onChange={handleChange}
            required
            className="form-control"
          >
            <option value="">Select your residence</option>
            {RESIDENCES.map((res) => (
              <option key={res} value={res}>
                {res}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="deliverySlot">Delivery Time Slot *</label>
          <select
            id="deliverySlot"
            name="deliverySlot"
            value={formData.deliverySlot}
            onChange={handleChange}
            required
            className="form-control"
          >
            <option value="">Select delivery slot</option>
            {DELIVERY_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="providerId">Service Provider *</label>
          
          {/* ✅ Show loading state */}
          {fetchingProviders && (
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#EFF6FF', 
              borderRadius: '6px',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span className="spinner-small"></span>
              <span>Checking provider availability...</span>
            </div>
          )}
          
          <select
            id="providerId"
            name="providerId"
            value={formData.providerId}
            onChange={handleChange}
            required
            className="form-control"
            disabled={!Array.isArray(providers) || providers.length === 0 || fetchingProviders}
          >
            <option value="">
              {fetchingProviders ? 'Loading...' : 
               providers.length === 0 ? 'No providers available' : 
               'Select provider'}
            </option>
            {Array.isArray(providers) && providers.map((provider) => (
              <option key={provider._id} value={provider._id}>
                ✅ {provider.name} - {provider.email}
              </option>
            ))}
          </select>
          
          {/* ✅ Show warning if no providers */}
          {!fetchingProviders && (!Array.isArray(providers) || providers.length === 0) && (
            <div style={{ 
              marginTop: '8px', 
              padding: '12px', 
              backgroundColor: '#FEF3C7', 
              borderRadius: '6px',
              fontSize: '0.9rem'
            }}>
              <strong>⚠️ No providers available</strong>
              <p style={{ margin: '4px 0 0 0', color: '#92400E' }}>
                All service providers are currently unavailable. Please check back later.
              </p>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="paymentMethod">Payment Method *</label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            required
            className="form-control"
          >
            <option value="cash_on_delivery">Cash on Delivery</option>
            <option value="card">Card Payment (Minimum R{(MINIMUM_ORDER_QUANTITY * PRICE_PER_LITER).toFixed(2)})</option>
          </select>
        </div>

        {/* Order Summary - UPDATED */}
        <div className="order-summary">
          <h3>Order Summary</h3>
          
          <div className="summary-section">
            <h4>Order Details</h4>
            <div className="summary-row">
              <span>Quantity:</span>
              <span>{formData.quantity} Liters</span>
            </div>
            <div className="summary-row">
              <span>Price per Liter:</span>
              <span>R{PRICE_PER_LITER.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Residence:</span>
              <span>{formData.residence || 'Not selected'}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Time:</span>
              <span>{formData.deliverySlot || 'Not selected'}</span>
            </div>
          </div>

          <div className="summary-section">
            <h4>Service Information</h4>
            <div className="summary-row">
              <span>Service Provider:</span>
              <span>{getSelectedProviderName()}</span>
            </div>
            <div className="summary-row">
              <span>Payment Method:</span>
              <span>{getPaymentMethodDisplay()}</span>
            </div>
          </div>

          <div className="summary-section summary-total">
            <div className="summary-row total">
              <span>Total Amount:</span>
              <span className="total-price">R{calculateTotal()}</span>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary btn-block"
          disabled={loading || !Array.isArray(providers) || providers.length === 0 || (formData.paymentMethod === 'card' && formData.quantity < MINIMUM_ORDER_QUANTITY)}
        >
          {loading ? 'Processing...' : formData.paymentMethod === 'card' ? 'Proceed to Payment' : 'Place Order'}
        </button>
      </form>

      {/* Provider Cards - NEW SECTION */}
      <div className="provider-cards-container">
        <h3>Available Service Providers</h3>
        <div className="provider-cards">
          {Array.isArray(providers) && providers.map((provider) => (
            <div className="provider-card" key={provider._id}>
              <div className="provider-header">
                <h4>{provider.name}</h4>
                <div className="provider-status">
                  <span className="status-dot" style={{ backgroundColor: '#10b981' }}></span>
                  <span className="status-text">Available</span>
                </div>
              </div>
              
              <div className="provider-details">
                <div className="provider-info">
                  <p className="provider-email">
                    <strong>📧 Email:</strong> {provider.email}
                  </p>
                  {provider.phone && (
                    <p className="provider-phone">
                      <strong>📞 Phone:</strong> {provider.phone}
                    </p>
                  )}
                </div>
              </div>
              
              {formData.providerId === provider._id && (
                <div className="selection-indicator">
                  <span className="selected-check">✓ Selected</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ✅ SHOW MESSAGE IF NO PROVIDERS AVAILABLE */}
      {Array.isArray(providers) && providers.length === 0 && (
        <div className="providers-section">
          <div className="empty-providers" style={{
            textAlign: 'center',
            padding: '40px 20px',
            backgroundColor: '#F9FAFB',
            borderRadius: '8px',
            border: '2px dashed #D1D5DB'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>😔</div>
            <h3>No Providers Available</h3>
            <p style={{ color: '#6B7280', marginTop: '8px' }}>
              All service providers are currently unavailable. Please check back later or try refreshing.
            </p>
            <button 
              type="button"
              onClick={fetchProviders}
              style={{
                marginTop: '16px',
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              🔄 Refresh Providers
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderForm;