const express = require('express');
const router = express.Router();
const { 
  forgotPassword, 
  resetPassword,
  verifyResetToken 
} = require('../controllers/passwordController');

// Password reset routes
router.post('/forgot', forgotPassword);
router.put('/reset/:resetToken', resetPassword);
router.get('/verify/:resetToken', verifyResetToken);

module.exports = router;