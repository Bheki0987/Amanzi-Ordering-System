const { body, param, validationResult } = require('express-validator');

/**
 * Middleware to check validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

/**
 * Validation rules for order creation
 */
const validateOrderCreation = [
  body('quantity')
    .isInt({ min: 1, max: 200 })
    .withMessage('Quantity must be between 1 and 200 liters'),
  
  body('residence')
    .trim()
    .notEmpty()
    .withMessage('Residence is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Residence must be between 2 and 100 characters'),
  
  body('deliverySlot')
    .trim()
    .notEmpty()
    .withMessage('Delivery slot is required')
    .matches(/^\d{2}:\d{2}\s*-\s*\d{2}:\d{2}$/)
    .withMessage('Delivery slot must be in format HH:MM - HH:MM'),
  
  body('providerId')
    .trim()
    .notEmpty()
    .withMessage('Provider ID is required')
    .isMongoId()
    .withMessage('Invalid provider ID'),
  
  body('specialInstructions')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Special instructions must be less than 500 characters'),
  
  body('paymentMethod')
    .isIn(['cash_on_delivery', 'online_payment'])
    .withMessage('Payment method must be either cash_on_delivery or online_payment'),
  
  validate
];

/**
 * Validation rules for order status update
 */
const validateOrderStatusUpdate = [
  param('id')
    .isMongoId()
    .withMessage('Invalid order ID'),
  
  body('status')
    .isIn(['pending', 'accepted', 'completed', 'rejected', 'cancelled'])
    .withMessage('Invalid status value'),
  
  validate
];

/**
 * Validation rules for MongoDB ObjectId params
 */
const validateMongoId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  
  validate
];

module.exports = {
  validate,
  validateOrderCreation,
  validateOrderStatusUpdate,
  validateMongoId
};