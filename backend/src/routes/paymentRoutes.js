const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createPaymentIntent,
  getPaymentStatus,
  confirmStripePayment,
  handlePaymentSuccess,
  handlePaymentCancel,
  handleStripeWebhook
} = require('../controllers/paymentController');

// Create payment intent
router.post('/create-intent', protect, createPaymentIntent);

// Get payment status
router.get('/status/:orderId', protect, getPaymentStatus);

// Confirm payment
router.post('/confirm', protect, confirmStripePayment);

// Success/Cancel redirects
router.get('/success', handlePaymentSuccess);
router.get('/cancel', handlePaymentCancel);

// Stripe webhook (must be raw body)
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

module.exports = router;