const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  register, 
  login, 
  getUserProfile, 
  updateUserProfile
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

module.exports = router;