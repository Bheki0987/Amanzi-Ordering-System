import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPaymentIntent, confirmPayment } from '../../services/paymentService';
import './StripePayment.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ orderId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');

  useEffect(() => {
    initializePayment();
  }, [orderId]);

  const initializePayment = async () => {
    try {
      console.log('Initializing payment for order:', orderId);
      const response = await createPaymentIntent(orderId);
      
      if (response.success) {
        setClientSecret(response.clientSecret);
        setPaymentIntentId(response.paymentIntentId);
        console.log('Payment intent created successfully');
      } else {
        setError(response.message || 'Failed to initialize payment');
      }
    } catch (err) {
      console.error('Failed to initialize payment', err);
      setError(err.response?.data?.message || 'Failed to initialize payment');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);

      // Confirm the payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (stripeError) {
        console.error('Stripe error:', stripeError);
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      console.log('Payment intent confirmed:', paymentIntent);

      // Confirm payment on backend
      if (paymentIntent.status === 'succeeded') {
        try {
          const confirmResponse = await confirmPayment(paymentIntent.id);
          console.log('Backend confirmation:', confirmResponse);
          
          if (confirmResponse.success) {
            // Navigate to dashboard with success message
            navigate('/customer/dashboard?payment=success');
          } else {
            setError('Payment succeeded but order update failed. Please contact support.');
          }
        } catch (confirmError) {
          console.error('Backend confirmation error:', confirmError);
          // Payment succeeded on Stripe, but backend update failed
          // Still navigate to dashboard as payment is successful
          navigate('/customer/dashboard?payment=success');
        }
      } else {
        setError('Payment failed. Please try again.');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <div className="stripe-payment-container">
      <div className="payment-card">
        <h2>Complete Your Payment</h2>
        
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="stripe-form">
          <div className="form-group">
            <label>Card Details</label>
            <div className="card-element-wrapper">
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          <button
            type="submit"
            disabled={!stripe || processing || !clientSecret}
            className="btn btn-primary btn-block"
          >
            {processing ? 'Processing...' : 'Pay Now'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/customer/dashboard')}
            className="btn btn-secondary btn-block"
            style={{ marginTop: '10px' }}
          >
            Cancel
          </button>
        </form>

        <div className="payment-security">
          <p>
            <i className="fas fa-lock"></i>
            Your payment is secured by Stripe
          </p>
        </div>
      </div>
    </div>
  );
};

const StripePayment = () => {
  const { orderId } = useParams();

  if (!orderId) {
    return (
      <div className="error-container">
        <p>Invalid order ID</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm orderId={orderId} />
    </Elements>
  );
};

export default StripePayment;