const express = require('express');
const router = express.Router();
const { handleStripeWebhook } = require('../controllers/webhookController');

// Stripe webhook - RAW BODY REQUIRED (no JSON parsing)
router.post('/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

module.exports = router;