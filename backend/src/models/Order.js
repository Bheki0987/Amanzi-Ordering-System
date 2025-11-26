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
      required: [true, 'Residence is required']
    },
    location: {
      type: String,
      required: false,
      default: function() { return this.residence; }
    },
    deliverySlot: {
      type: String,
      required: [true, 'Delivery slot is required'],
      enum: ['10:00-12:00', '18:00-22:00']
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'completed', 'rejected', 'cancelled'],
      default: 'pending'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'processing', 'succeeded', 'failed', 'cancelled'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'cash_on_delivery'],
      default: 'cash_on_delivery'
    },
    paymentIntentId: {
      type: String,
      default: null
    },
    stripePaymentId: {
      type: String,
      default: null
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
    },
    specialInstructions: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Order', orderSchema);