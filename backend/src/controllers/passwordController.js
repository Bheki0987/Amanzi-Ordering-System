const User = require('../models/User');
const crypto = require('crypto');
const { sendPasswordResetEmail, sendPasswordChangeConfirmation } = require('../services/emailService');

// @desc    Request password reset
// @route   POST /api/password/forgot
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if email is provided
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with that email address'
      });
    }
    
    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    
    // Save user with reset token
    await user.save({ validateBeforeSave: false });
    
    // Send email
    const emailResult = await sendPasswordResetEmail(user.email, resetToken);
    
    if (!emailResult.success) {
      // If email fails, remove reset token
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      
      return res.status(500).json({
        success: false,
        message: 'Email could not be sent. Please try again later.'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully. Please check your inbox.'
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again.'
    });
  }
};

// @desc    Reset password
// @route   PUT /api/password/reset/:resetToken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    
    // Validate password
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }
    
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');
    
    // Find user by token and check if not expired
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }
    
    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();
    
    // Send confirmation email
    await sendPasswordChangeConfirmation(user.email, user.name);
    
    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again.'
    });
  }
};

// @desc    Verify reset token
// @route   GET /api/password/verify/:resetToken
// @access  Public
exports.verifyResetToken = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');
    
    // Find user by token and check if not expired
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      email: user.email
    });
    
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again.'
    });
  }
};