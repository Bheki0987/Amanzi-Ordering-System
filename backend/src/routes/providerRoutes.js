const express = require('express');
const router = express.Router();
const { 
  getAllProviders, 
  getAvailableProviders,
  updateAvailabilityStatus,
  getProviderById, 
  updateProviderDetails,
  getProviderProfile,
  updateProviderProfile
} = require('../controllers/providerController');
const { protect } = require('../middleware/authMiddleware');

// Public routes FIRST (no auth required)
router.get('/available', getAvailableProviders); // MUST be before /:id
router.get('/', getAllProviders);

// Protected routes for specific paths BEFORE parameterized routes
router.get('/profile', protect, getProviderProfile); // MUST be before /:id
router.put('/profile', protect, updateProviderProfile);
router.put('/details', protect, updateProviderDetails);
router.put('/availability', protect, updateAvailabilityStatus);

// Parameterized routes LAST (so they don't catch other routes)
router.get('/:id', getProviderById);

module.exports = router;