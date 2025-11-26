const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    maxlength: [12, 'Password must not exceed 12 characters'],
    select: false,
    validate: {
      validator: function(value) {
        // Check for at least one uppercase letter
        const hasUpperCase = /[A-Z]/.test(value);
        // Check for at least one special character
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
        
        return hasUpperCase && hasSpecialChar;
      },
      message: 'Password must contain at least one uppercase letter and one special character'
    }
  },
  role: {
    type: String,
    enum: ['customer', 'provider', 'admin'],
    default: 'customer'
  },
  phone: {
    type: String,
    required: function() {
      return this.role === 'provider'; // Required only for providers
    },
    validate: {
      validator: function(value) {
        // If provider, must have valid phone
        if (this.role === 'provider') {
          return value && value.length >= 10;
        }
        return true; // For non-providers, any value is ok
      },
      message: 'Phone number is required for service providers (minimum 10 digits)'
    },
    default: ''  
  },
  residence: {
    type: String,
    required: false,  // Changed from conditional to false
    default: ''       // Added default empty string
  },
  location: {
    type: String,
    required: false,
    default: function() { return this.residence || ''; }
  },
  
  // Password reset fields
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  // Provider-specific fields
  providerDetails: {
    businessName: String,
    description: String,
    serviceArea: [String],
    isAvailable: {
      type: Boolean,
      default: true
    },
    availabilityStatus: {
      type: String,
      enum: ['available', 'unavailable'], // ✅ SIMPLIFIED TO 2 OPTIONS
      default: 'available'
    },
    lastStatusUpdate: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ userId: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

module.exports = mongoose.model('User', userSchema);