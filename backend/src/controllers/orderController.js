const Order = require('../models/Order');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Customer)
exports.createOrder = async (req, res) => {
  try {
    const { quantity, residence, deliverySlot } = req.body;
    
    // Calculate price (R4 per liter)
    const pricePerLiter = 4;
    const totalPrice = quantity * pricePerLiter;
    
    // Get available provider (basic implementation - in a real system, you'd have more logic)
    const provider = await User.findOne({ role: 'provider' });
    
    // Create order
    const order = await Order.create({
      customerId: req.user.id,
      providerId: provider ? provider._id : null,
      quantity,
      totalPrice,
      residence,
      deliverySlot,
      status: 'pending',
      orderDate: new Date()
    });
    
    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create order'
    });
  }
};

// @desc    Get logged-in user orders
// @route   GET /api/orders/my-orders
// @access  Private (Customer)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user.id })
      .sort({ createdAt: -1 }) // Newest first
      .populate('providerId', 'name email');
      
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch orders'
    });
  }
};

// @desc    Get orders for provider
// @route   GET /api/orders/provider-orders
// @access  Private (Provider)
exports.getProviderOrders = async (req, res) => {
  try {
    const orders = await Order.find({ providerId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('customerId', 'name email residence');
      
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch provider orders'
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Provider)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    if (!['pending', 'accepted', 'completed', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    // Find the order
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if this provider owns this order
    if (order.providerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }
    
    // Update status
    order.status = status;
    
    // If status is completed, set delivery date
    if (status === 'completed') {
      order.deliveryDate = new Date();
    }
    
    await order.save();
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update order status'
    });
  }
};

// @desc    Get order statistics for provider
// @route   GET /api/orders/stats
// @access  Private (Provider)
exports.getOrderStats = async (req, res) => {
  try {
    // Get all orders for this provider
    const allOrders = await Order.find({ providerId: req.user.id });
    
    // Calculate stats manually
    const total = allOrders.length;
    const pending = allOrders.filter(order => order.status === 'pending').length;
    const accepted = allOrders.filter(order => order.status === 'accepted').length;
    const completed = allOrders.filter(order => order.status === 'completed').length;
    const rejected = allOrders.filter(order => order.status === 'rejected').length;
    
    // Calculate total revenue from completed orders
    const totalRevenue = allOrders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + order.totalPrice, 0);
    
    res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        accepted,
        completed,
        rejected,
        totalRevenue
      }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch order statistics'
    });
  }
};