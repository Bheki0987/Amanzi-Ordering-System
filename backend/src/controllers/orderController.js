const Order = require('../models/Order');
const User = require('../models/User');
const { sendEmail } = require('../services/emailService');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Customer)
exports.createOrder = async (req, res) => {
  try {
    const { quantity, residence, deliverySlot, providerId, paymentMethod, specialInstructions } = req.body;

    // Validate required fields
    if (!quantity || !residence || !deliverySlot || !providerId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Verify provider exists and is a provider
    const provider = await User.findById(providerId);
    if (!provider || provider.role !== 'provider') {
      return res.status(400).json({
        success: false,
        message: 'Invalid service provider'
      });
    }

    // Calculate total price (R2.00 per liter)
    const pricePerLiter = 2.00;
    const totalPrice = quantity * pricePerLiter;

    // Create order
    const order = await Order.create({
      customerId: req.user.id,
      providerId,
      quantity,
      totalPrice,
      residence,
      location: residence,
      deliverySlot,
      paymentMethod: paymentMethod || 'cash_on_delivery',
      paymentStatus: paymentMethod === 'card' ? 'pending' : 'pending',
      specialInstructions: specialInstructions || '',
      status: 'pending',
      orderDate: new Date()
    });

    // Populate customer and provider details
    const populatedOrder = await Order.findById(order._id)
      .populate('customerId', 'name email residence')
      .populate('providerId', 'name email phone');

    // Send email notification to provider
    try {
      await sendEmail({
        to: provider.email,
        subject: 'New Water Order Received',
        html: `
          <h2>New Order Notification</h2>
          <p>You have received a new water order:</p>
          <ul>
            <li><strong>Order ID:</strong> ${order._id}</li>
            <li><strong>Customer:</strong> ${req.user.name}</li>
            <li><strong>Quantity:</strong> ${quantity} Liters</li>
            <li><strong>Residence:</strong> ${residence}</li>
            <li><strong>Delivery Slot:</strong> ${deliverySlot}</li>
            <li><strong>Total Price:</strong> R${totalPrice.toFixed(2)}</li>
            <li><strong>Payment Method:</strong> ${paymentMethod === 'card' ? 'Card Payment' : 'Cash on Delivery'}</li>
          </ul>
          <p>Please login to your dashboard to accept or reject this order.</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the order creation if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create order'
    });
  }
};

// @desc    Get all orders (for admin/provider)
// @route   GET /api/orders
// @access  Private (Admin/Provider)
exports.getOrders = async (req, res) => {
  try {
    let query = {};

    // If user is a provider, only show their orders
    if (req.user.role === 'provider') {
      query.providerId = req.user.id;
    }
    // If user is a customer, only show their orders
    else if (req.user.role === 'customer') {
      query.customerId = req.user.id;
    }

    const orders = await Order.find(query)
      .populate('customerId', 'name email residence')
      .populate('providerId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch orders'
    });
  }
};

// @desc    Get my orders (customer)
// @route   GET /api/orders/my-orders
// @access  Private (Customer)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user.id })
      .populate('providerId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch orders'
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name email residence')
      .populate('providerId', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is authorized to view this order
    if (
      req.user.role !== 'admin' &&
      order.customerId._id.toString() !== req.user.id &&
      order.providerId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch order'
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Provider/Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide order status'
      });
    }

    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name email')
      .populate('providerId', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && order.providerId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    order.status = status;
    
    if (status === 'completed') {
      order.deliveryDate = new Date();
    }

    await order.save();

    // Send email notification to customer
    try {
      let emailSubject = '';
      let emailBody = '';

      switch (status) {
        case 'accepted':
          emailSubject = 'Order Accepted';
          emailBody = `
            <h2>Your Order Has Been Accepted</h2>
            <p>Good news! Your water order has been accepted.</p>
            <p><strong>Order Details:</strong></p>
            <ul>
              <li>Order ID: ${order._id}</li>
              <li>Quantity: ${order.quantity} Liters</li>
              <li>Delivery Slot: ${order.deliverySlot}</li>
              <li>Total: R${order.totalPrice.toFixed(2)}</li>
            </ul>
            <p>Your water will be delivered during the specified time slot.</p>
          `;
          break;
        case 'completed':
          emailSubject = 'Order Completed';
          emailBody = `
            <h2>Your Order Has Been Delivered</h2>
            <p>Your water order has been successfully delivered.</p>
            <p>Thank you for using Amanzi Ordering System!</p>
          `;
          break;
        case 'rejected':
          emailSubject = 'Order Rejected';
          emailBody = `
            <h2>Order Rejected</h2>
            <p>Unfortunately, your order could not be accepted at this time.</p>
            <p>Please try placing a new order or contact support.</p>
          `;
          break;
      }

      if (emailSubject) {
        await sendEmail({
          to: order.customerId.email,
          subject: emailSubject,
          html: emailBody
        });
      }
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated',
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
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
    const providerId = req.user.role === 'provider' ? req.user.id : null;

    if (!providerId) {
      return res.status(403).json({
        success: false,
        message: 'Only providers can access statistics'
      });
    }

    const stats = await Order.aggregate([
      { $match: { providerId: require('mongoose').Types.ObjectId(providerId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' }
        }
      }
    ]);

    const formattedStats = {
      total: 0,
      pending: 0,
      accepted: 0,
      completed: 0,
      rejected: 0,
      totalRevenue: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
      if (stat._id === 'completed') {
        formattedStats.totalRevenue = stat.totalRevenue;
      }
    });

    res.status(200).json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch order statistics'
    });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private (Admin)
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await order.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete order'
    });
  }
};