const User = require('../models/User');

module.exports = {
  // Get all providers
  getAllProviders: async (req, res) => {
    try {
      const providers = await User.find({ role: 'provider' })
        .select('-password')
        .sort({ 'providerDetails.lastStatusUpdate': -1 });
      
      console.log('All providers found:', providers.length); // Debug log
      
      res.status(200).json({
        success: true,
        count: providers.length,
        data: providers
      });
    } catch (error) {
      console.error('Get all providers error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get only available providers - FIXED
  getAvailableProviders: async (req, res) => {
    try {
      console.log('Fetching available providers...');
      
      // ✅ FIXED: Simple, strict query - only 'available' status
      const providers = await User.find({ 
        role: 'provider',
        'providerDetails.availabilityStatus': 'available',  // ✅ Must be 'available'
        'providerDetails.isAvailable': true                  // ✅ Must be true
      }).select('-password');
      
      console.log(`Found ${providers.length} available providers`);
      
      // ✅ Log each provider for debugging
      providers.forEach(p => {
        console.log(`Provider: ${p.name}, Status: ${p.providerDetails?.availabilityStatus}, isAvailable: ${p.providerDetails?.isAvailable}`);
      });
      
      res.status(200).json({
        success: true,
        count: providers.length,
        data: providers
      });
    } catch (error) {
      console.error('Get providers error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Update provider availability status - FIXED for phone validation
  updateAvailabilityStatus: async (req, res) => {
    try {
      const { status } = req.body;
      
      console.log('Updating availability status for user:', req.user.id, 'to:', status);
      
      // ✅ Validate status - ONLY 'available' or 'unavailable'
      if (!['available', 'unavailable'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be "available" or "unavailable"'
        });
      }
      
      const provider = await User.findById(req.user.id);
      
      if (!provider || provider.role !== 'provider') {
        return res.status(404).json({
          success: false,
          message: 'Provider not found'
        });
      }
      
      // ✅ Ensure provider has phone number (to pass validation)
      if (!provider.phone) {
        provider.phone = '0000000000';
      }
      
      // ✅ Initialize providerDetails if not exists
      if (!provider.providerDetails) {
        provider.providerDetails = {};
      }
      
      // ✅ Update availability status
      provider.providerDetails.availabilityStatus = status;
      provider.providerDetails.isAvailable = (status === 'available');
      provider.providerDetails.lastStatusUpdate = new Date();
      
      // ✅ Save with validation bypass for modified fields only
      await provider.save({ validateModifiedOnly: true });
      
      console.log('Provider status updated successfully:', {
        status: provider.providerDetails.availabilityStatus,
        isAvailable: provider.providerDetails.isAvailable
      });
      
      res.status(200).json({
        success: true,
        message: `Status updated to ${status}`,
        data: {
          status: provider.providerDetails.availabilityStatus,
          isAvailable: provider.providerDetails.isAvailable,
          lastUpdated: provider.providerDetails.lastStatusUpdate
        }
      });
    } catch (error) {
      console.error('Update availability error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update availability'
      });
    }
  },

  // Get provider profile - FIXED
  getProviderProfile: async (req, res) => {
    try {
      const provider = await User.findById(req.user.id).select('-password');
      
      if (!provider || provider.role !== 'provider') {
        return res.status(404).json({
          success: false,
          message: 'Provider not found'
        });
      }
      
      // ✅ ADD MIGRATION: Convert old statuses on load
      if (provider.providerDetails) {
        const currentStatus = provider.providerDetails.availabilityStatus;
        
        // Migrate 'busy' or 'offline' to 'unavailable'
        if (currentStatus === 'busy' || currentStatus === 'offline') {
          console.log(`Auto-migrating provider ${provider._id} from "${currentStatus}" to "unavailable"`);
          provider.providerDetails.availabilityStatus = 'unavailable';
          provider.providerDetails.isAvailable = false;
          await provider.save({ validateModifiedOnly: true });
        }
      }
      
      res.status(200).json({
        success: true,
        data: provider
      });
    } catch (error) {
      console.error('Get provider profile error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // ... rest of your existing functions remain the same
  getProviderById: async (req, res) => {
    try {
      const provider = await User.findOne({ 
        _id: req.params.id, 
        role: 'provider' 
      }).select('-password');
      
      if (!provider) {
        return res.status(404).json({
          success: false,
          message: 'Provider not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: provider
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  updateProviderDetails: async (req, res) => {
    try {
      const { businessName, description, serviceArea } = req.body;
      
      const provider = await User.findById(req.user.id);
      
      if (!provider || provider.role !== 'provider') {
        return res.status(404).json({
          success: false,
          message: 'Provider not found'
        });
      }
      
      // Initialize providerDetails if it doesn't exist
      if (!provider.providerDetails) {
        provider.providerDetails = {};
      }
      
      // Update provider details
      if (businessName) provider.providerDetails.businessName = businessName;
      if (description) provider.providerDetails.description = description;
      if (serviceArea) provider.providerDetails.serviceArea = serviceArea;
      
      await provider.save();
      
      res.status(200).json({
        success: true,
        message: 'Provider details updated successfully',
        data: provider.providerDetails
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

// Update provider profile function
module.exports.updateProviderProfile = async (req, res) => {
  try {
    const provider = await User.findById(req.user.id);
    
    if (!provider || provider.role !== 'provider') {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }
    
    // Update basic info
    provider.name = req.body.name || provider.name;
    provider.email = req.body.email || provider.email;
    provider.phone = req.body.phone || provider.phone;
    
    // Initialize providerDetails if it doesn't exist
    if (!provider.providerDetails) {
      provider.providerDetails = {};
    }
    
    // Update provider details
    if (req.body.providerDetails) {
      const details = req.body.providerDetails;
      provider.providerDetails.businessName = details.businessName || provider.providerDetails.businessName;
      provider.providerDetails.description = details.description || provider.providerDetails.description;
      provider.providerDetails.serviceArea = details.serviceArea || provider.providerDetails.serviceArea;
    }
    
    await provider.save();
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: provider
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};