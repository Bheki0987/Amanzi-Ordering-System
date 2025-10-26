const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = {
  // Register a new user
  register: async (req, res) => {
    try {
      const { name, email, password, phone, location, role } = req.body;

      // Check if user already exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create user based on role
      const user = await User.create({
        name,
        email,
        password,
        phone,
        location,
        role,
        ...(role === 'provider' && req.body.providerDetails 
          ? { providerDetails: req.body.providerDetails } 
          : {})
      });

      if (user) {
        res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        });
      } else {
        res.status(400).json({ message: 'Invalid user data' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide email and password'
        });
      }
      
      // Find user by email and include password for comparison
      const user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      // Check if password matches
      const isMatch = await user.matchPassword(password);
      
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      // Create and send token
      const token = generateToken(user._id);
      
      // Remove password from response
      const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        residence: user.residence,
        location: user.location
      };
      
      res.status(200).json({
        success: true,
        token,
        user: userResponse
      });
      
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  },

  // Get user profile
  getUserProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select('-password');

      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update user profile
  updateUserProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user._id);

      if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        user.location = req.body.location || user.location;
        
        if (req.body.password) {
          user.password = req.body.password;
        }
        
        if (user.role === 'provider' && req.body.providerDetails) {
          user.providerDetails = {
            ...user.providerDetails,
            ...req.body.providerDetails
          };
        }

        const updatedUser = await user.save();

        res.json({
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          token: generateToken(updatedUser._id),
        });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};