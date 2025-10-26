const User = require('../models/User');

// @desc    Get customer profile
// @route   GET /api/customers/profile
// @access  Private (Customer)
exports.getCustomerProfile = async (req, res) => {
  try {
    // User is already available in req.user from auth middleware
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        residence: user.residence,
        location: user.location,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error getting customer profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update customer profile
// @route   PUT /api/customers/profile
// @access  Private (Customer)
exports.updateCustomerProfile = async (req, res) => {
  try {
    const { name, residence } = req.body;
    
    // Find and update the user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update fields
    if (name) user.name = name;
    if (residence) {
      user.residence = residence;
      user.location = residence; // Update location to match residence
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        residence: user.residence,
        location: user.location,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error updating customer profile:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};