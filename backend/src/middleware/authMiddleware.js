const jwt = require('jsonwebtoken');

// Protect routes
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Standardize the user object structure
      req.user = {
        id: decoded.userId || decoded.id,  // ← Normalize to 'id'
        userId: decoded.userId || decoded.id,  // ← Keep both for compatibility
        role: decoded.role
      };
      
      console.log('Authenticated user:', req.user);
      next();
    } catch (error) {
      console.error('❌ Auth middleware error:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
        error: error.message
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Authorize based on role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    try {
      console.log('🔐 Authorization check - User role:', req.user?.role, 'Required roles:', roles);
      
      if (!req.user) {
        console.error('❌ No user object in authorize middleware');
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      if (!req.user.role) {
        console.error('❌ User has no role:', req.user);
        return res.status(403).json({
          success: false,
          message: 'User role not defined'
        });
      }

      if (!roles.includes(req.user.role)) {
        console.error(`❌ User role '${req.user.role}' not in allowed roles:`, roles);
        return res.status(403).json({
          success: false,
          message: `User role '${req.user.role}' is not authorized to access this route`
        });
      }

      console.log('✅ Authorization successful');
      next();
    } catch (error) {
      console.error('❌ Error in authorize middleware:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization error',
        error: error.message
      });
    }
  };
};