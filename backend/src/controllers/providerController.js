const User = require('../models/User');

module.exports = {
  // Get all providers
  getAllProviders: async (req, res) => {
    try {
      const providers = await User.find({ role: 'provider' })
        .select('-password')
        .sort({ name: 1 });
      
      res.json(providers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get provider by ID
  getProviderById: async (req, res) => {
    try {
      const provider = await User.findOne({ 
        _id: req.params.id,
        role: 'provider'
      }).select('-password');
      
      if (!provider) {
        return res.status(404).json({ message: 'Provider not found' });
      }
      
      res.json(provider);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update provider details
  updateProviderDetails: async (req, res) => {
    try {
      const provider = await User.findById(req.user._id);
      
      if (!provider || provider.role !== 'provider') {
        return res.status(404).json({ message: 'Provider not found' });
      }
      
      if (req.body.providerDetails) {
        provider.providerDetails = {
          ...provider.providerDetails,
          ...req.body.providerDetails
        };
      }
      
      const updatedProvider = await provider.save();
      
      res.json({
        _id: updatedProvider._id,
        name: updatedProvider.name,
        providerDetails: updatedProvider.providerDetails
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

// @desc    Get provider profile
// @route   GET /api/providers/profile
// @access  Private (Provider)
module.exports.getProviderProfile = async (req, res) => {
  try {
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
        location: user.location,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error getting provider profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update provider profile
// @route   PUT /api/providers/profile
// @access  Private (Provider)
module.exports.updateProviderProfile = async (req, res) => {
  try {
    const { name, location } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (name) user.name = name;
    if (location) user.location = location;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        location: user.location,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error updating provider profile:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};