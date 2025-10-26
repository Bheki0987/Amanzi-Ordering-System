const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getMyOrders, // Changed from getCustomerOrders
  getProviderOrders, 
  updateOrderStatus, 
  getOrderStats // Changed from getOrderById which was undefined
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Customer routes
router.post('/', protect, authorize('customer'), createOrder);
router.get('/my-orders', protect, authorize('customer'), getMyOrders);

// Provider routes
router.get('/provider-orders', protect, authorize('provider'), getProviderOrders);
router.put('/:id/status', protect, authorize('provider'), updateOrderStatus);
router.get('/stats', protect, authorize('provider'), getOrderStats);

module.exports = router;