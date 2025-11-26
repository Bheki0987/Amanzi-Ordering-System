const { verifyWebhookSignature } = require('../config/stripe');
const Order = require('../models/Order');

// @desc    Handle Stripe webhook events
// @route   POST /api/webhooks/stripe
// @access  Public (verified by signature)
exports.handleStripeWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  
  try {
    // Verify webhook signature
    const event = verifyWebhookSignature(req.body, signature);
    
    console.log('📨 Stripe webhook received:', event.type);
    
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
      
      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object);
        break;
      
      default:
        console.log(`ℹ️  Unhandled event type: ${event.type}`);
    }
    
    // Return success response
    res.status(200).json({ received: true });
    
  } catch (error) {
    console.error('❌ Webhook error:', error.message);
    res.status(400).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
};

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId;
    
    const order = await Order.findById(orderId);
    if (!order) {
      console.error('❌ Order not found:', orderId);
      return;
    }
    
    order.paymentStatus = 'paid';
    order.paymentDetails = {
      ...order.paymentDetails,
      stripePaymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      paidAt: new Date()
    };
    
    await order.save();
    
    console.log('✅ Payment confirmed for order:', orderId);
    
    // TODO: Send confirmation email/notification to customer
    
  } catch (error) {
    console.error('❌ Error handling payment success:', error);
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailure(paymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId;
    
    const order = await Order.findById(orderId);
    if (!order) {
      console.error('❌ Order not found:', orderId);
      return;
    }
    
    order.paymentStatus = 'failed';
    order.paymentDetails = {
      ...order.paymentDetails,
      stripePaymentIntentId: paymentIntent.id,
      failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
      failedAt: new Date()
    };
    
    await order.save();
    
    console.log('⚠️  Payment failed for order:', orderId);
    
    // TODO: Notify customer about failed payment
    
  } catch (error) {
    console.error('❌ Error handling payment failure:', error);
  }
}

/**
 * Handle canceled payment
 */
async function handlePaymentCanceled(paymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId;
    
    const order = await Order.findById(orderId);
    if (!order) {
      console.error('❌ Order not found:', orderId);
      return;
    }
    
    order.status = 'cancelled';
    order.paymentStatus = 'failed';
    
    await order.save();
    
    console.log('⚠️  Payment canceled for order:', orderId);
    
  } catch (error) {
    console.error('❌ Error handling payment cancelation:', error);
  }
}