const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// Import controller functions
const {
  createOrder,
  getOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
  deleteOrder
} = require('../controllers/orderController');

// Customer routes
router.post('/', protect, authorize('customer'), createOrder);
router.get('/my-orders', protect, authorize('customer'), getMyOrders);

// Provider routes
router.get('/stats', protect, authorize('provider'), getOrderStats);

// Shared routes - getOrders filters based on user role automatically
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);

// Provider/Admin routes - update order status
router.put('/:id/status', protect, authorize('provider', 'admin'), updateOrderStatus);

// Admin routes
router.delete('/:id', protect, authorize('admin'), deleteOrder);

module.exports = router;