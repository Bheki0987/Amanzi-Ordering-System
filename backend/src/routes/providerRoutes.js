const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// Import the controller properly
// Note: If these functions don't exist yet, they will be defined below
const { 
  getProviderProfile, 
  updateProviderProfile 
} = require('../controllers/providerController');

// Now both routes will have defined callback functions
router.get('/profile', protect, authorize('provider'), getProviderProfile);
router.put('/profile', protect, authorize('provider'), updateProviderProfile);

module.exports = router;