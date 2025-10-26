const express = require('express');
const router = express.Router();
const { register, login, getUserProfile, updateUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

module.exports = router;