const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    quantity: {
      type: Number,
      required: [true, 'Please add water quantity'],
      min: [5, 'Minimum order is 5 liters'],
      max: [100, 'Maximum order is 100 liters']
    },
    totalPrice: {
      type: Number,
      required: true
    },
    residence: {
      type: String,
      required: true
    },
    deliverySlot: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'completed', 'rejected'],
      default: 'pending'
    },
    orderDate: {
      type: Date,
      default: Date.now
    },
    deliveryDate: {
      type: Date
    },
    notes: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;