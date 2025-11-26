const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const STRIPE_CONFIG = {
  currency: 'zar', // South African Rand
  pricePerLiter: 2.00, // R2.00 per liter
  minimumAmount: 10.00, // R10.00 minimum (Stripe requirement for ZAR)
};

/**
 * Create a payment intent for an order
 * @param {number} amount 
 * @param {object} metadata
 */
const createPaymentIntent = async (amount, metadata = {}) => {
  try {
    // Ensure minimum amount
    if (amount < STRIPE_CONFIG.minimumAmount) {
      throw new Error(`Minimum payment amount is R${STRIPE_CONFIG.minimumAmount.toFixed(2)}. Current amount: R${amount.toFixed(2)}`);
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: STRIPE_CONFIG.currency,
      metadata: {
        ...metadata,
        integration_check: 'accept_a_payment',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  } catch (error) {
    console.error('Stripe payment intent creation error:', error);
    throw error;
  }
};

/**
 * Retrieve a payment intent
 * @param {string} paymentIntentId
 */
const retrievePaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Stripe payment intent retrieval error:', error);
    throw error;
  }
};

/**
 * Confirm a payment intent
 * @param {string} paymentIntentId
 */
const confirmPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Stripe payment intent confirmation error:', error);
    throw error;
  }
};

module.exports = {
  stripe,
  STRIPE_CONFIG,
  createPaymentIntent,
  retrievePaymentIntent,
  confirmPaymentIntent,
};