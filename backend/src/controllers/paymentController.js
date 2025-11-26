const Order = require('../models/Order');
const { createPaymentIntent, retrievePaymentIntent, stripe } = require('../config/stripe');

// @desc    Create payment intent for an order
// @route   POST /api/payments/create-intent
// @access  Private (Customer)
exports.createPaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Find the order and populate customer details
    const order = await Order.findById(orderId).populate('customerId', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify the order belongs to the user
    if (order.customerId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to process payment for this order'
      });
    }

    // Check if payment already exists
    if (order.paymentIntentId) {
      try {
        const existingIntent = await retrievePaymentIntent(order.paymentIntentId);
        
        if (existingIntent.status === 'succeeded') {
          return res.status(400).json({
            success: false,
            message: 'Payment already completed for this order'
          });
        }

        // Return existing client secret if intent exists but not completed
        return res.status(200).json({
          success: true,
          clientSecret: existingIntent.client_secret,
          paymentIntentId: existingIntent.id
        });
      } catch (stripeError) {
        console.error('Error retrieving existing payment intent:', stripeError);
        // Continue to create new intent if retrieval fails
      }
    }

    // Create payment intent - DON'T multiply by 100 (stripe.js does it)
    const paymentIntent = await createPaymentIntent(order.totalPrice, {
      orderId: order._id.toString(),
      customerId: order.customerId._id.toString(),
      customerEmail: order.customerId.email,
      quantity: order.quantity,
      residence: order.residence
    });

    // Update order with payment intent ID
    order.paymentIntentId = paymentIntent.id;
    order.paymentStatus = 'processing';
    order.paymentMethod = 'card';
    await order.save();

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment intent'
    });
  }
};

// @desc    Get payment status for an order
// @route   GET /api/payments/status/:orderId
// @access  Private
exports.getPaymentStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify authorization
    if (order.customerId.toString() !== req.user.id && order.providerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this payment'
      });
    }

    let paymentDetails = null;

    if (order.paymentIntentId) {
      try {
        const paymentIntent = await retrievePaymentIntent(order.paymentIntentId);
        paymentDetails = {
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          paymentMethod: paymentIntent.payment_method
        };
      } catch (stripeError) {
        console.error('Error retrieving payment intent:', stripeError);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        paymentDetails
      }
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get payment status'
    });
  }
};

// @desc    Confirm Stripe payment
// @route   POST /api/payments/confirm
// @access  Private (Customer)
exports.confirmStripePayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment Intent ID is required'
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await retrievePaymentIntent(paymentIntentId);

    // Find order by payment intent ID
    const order = await Order.findOne({ paymentIntentId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order payment status based on Stripe status
    if (paymentIntent.status === 'succeeded') {
      order.paymentStatus = 'succeeded';
      order.stripePaymentId = paymentIntent.id;
      await order.save();

      return res.status(200).json({
        success: true,
        message: 'Payment confirmed successfully',
        data: order
      });
    } else {
      order.paymentStatus = 'failed';
      await order.save();

      return res.status(400).json({
        success: false,
        message: 'Payment not successful',
        status: paymentIntent.status
      });
    }
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to confirm payment'
    });
  }
};

// @desc    Handle successful payment redirect
// @route   GET /api/payments/success
// @access  Public
exports.handlePaymentSuccess = async (req, res) => {
  try {
    const { payment_intent } = req.query;

    if (!payment_intent) {
      return res.redirect(`${process.env.FRONTEND_URL}/customer/dashboard?payment=failed`);
    }

    const order = await Order.findOne({ paymentIntentId: payment_intent });

    if (order) {
      order.paymentStatus = 'succeeded';
      await order.save();
    }

    res.redirect(`${process.env.FRONTEND_URL}/customer/dashboard?payment=success&orderId=${order._id}`);
  } catch (error) {
    console.error('Payment success handler error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/customer/dashboard?payment=error`);
  }
};

// @desc    Handle cancelled payment redirect
// @route   GET /api/payments/cancel
// @access  Public
exports.handlePaymentCancel = async (req, res) => {
  try {
    res.redirect(`${process.env.FRONTEND_URL}/customer/dashboard?payment=cancelled`);
  } catch (error) {
    console.error('Payment cancel handler error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/customer/dashboard?payment=error`);
  }
};

// @desc    Stripe webhook handler
// @route   POST /api/payments/webhook
// @access  Public (Stripe only)
exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      
      // Update order status
      const order = await Order.findOne({ paymentIntentId: paymentIntent.id });
      if (order) {
        order.paymentStatus = 'succeeded';
        order.stripePaymentId = paymentIntent.id;
        await order.save();
        console.log(`Payment succeeded for order: ${order._id}`);
      }
      break;

    case 'payment_intent.payment_failed':
      const failedIntent = event.data.object;
      
      const failedOrder = await Order.findOne({ paymentIntentId: failedIntent.id });
      if (failedOrder) {
        failedOrder.paymentStatus = 'failed';
        await failedOrder.save();
        console.log(`Payment failed for order: ${failedOrder._id}`);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};