import API from './api';

// Create payment intent
export const createPaymentIntent = async (orderId) => {
  try {
    const response = await API.post('/payments/create-intent', { orderId });
    return response.data;
  } catch (error) {
    console.error('Create payment intent error:', error);
    throw error;
  }
};

// Get payment status for an order
export const getPaymentStatus = async (orderId) => {
  try {
    const response = await API.get(`/payments/status/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Get payment status error:', error);
    throw error;
  }
};

// Confirm payment
export const confirmPayment = async (paymentIntentId) => {
  try {
    const response = await API.post('/payments/confirm', { paymentIntentId });
    return response.data;
  } catch (error) {
    console.error('Confirm payment error:', error);
    throw error;
  }
};

// Check if payment is complete
export const checkPaymentComplete = async (orderId) => {
  try {
    const response = await getPaymentStatus(orderId);
    return response.data.paymentStatus === 'succeeded';
  } catch (error) {
    console.error('Check payment complete error:', error);
    throw error;
  }
};

export default {
  createPaymentIntent,
  getPaymentStatus,
  confirmPayment,
  checkPaymentComplete
};