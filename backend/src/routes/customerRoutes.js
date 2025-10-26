const express = require('express');
const router = express.Router();
const { 
  getCustomerProfile,
  updateCustomerProfile
} = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Customer protected routes
router.get('/profile', protect, authorize('customer'), getCustomerProfile);
router.put('/profile', protect, authorize('customer'), updateCustomerProfile);

module.exports = router;