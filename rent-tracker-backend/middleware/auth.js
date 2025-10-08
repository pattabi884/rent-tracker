const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    console.log('🔐 Auth Middleware - Starting...');
    console.log('📨 Request URL:', req.url);
    console.log('🔑 Authorization header exists:', !!req.headers.authorization);
    
    if (req.headers.authorization) {
      console.log('🔑 Authorization header value:', req.headers.authorization.substring(0, 50) + '...');
    }

    // Check for authorization header
    if (!req.headers.authorization) {
      console.log('❌ No authorization header found');
      req.user = { userId: null };
      return next();
    }

    const token = req.headers.authorization.replace('Bearer ', '');
    
    if (!token || token === 'null' || token === 'undefined') {
      console.log('❌ Invalid token format');
      req.user = { userId: null };
      return next();
    }

    console.log('✅ Token extracted, length:', token.length);

    // Get JWT secret - USE ONLY ENV VARIABLE TO MATCH CONTROLLER
    const JWT_SECRET = process.env.JWT_SECRET;
    console.log('🔐 Using JWT secret from env:', JWT_SECRET ? 'Secret exists' : 'No secret found');
    
    if (!JWT_SECRET) {
      console.log('❌ JWT_SECRET environment variable is not set!');
      req.user = { userId: null };
      return next();
    }

    // Verify the token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('🔓 Token decoded successfully!');
      console.log('📋 Decoded payload:', decoded);
      
      // Extract user ID
      const userId = decoded.userId || decoded._id || decoded.id || decoded.sub;
      console.log('👤 Extracted userId:', userId);
      
      if (userId) {
        req.user = { userId: userId };
        console.log('✅ User authenticated with ID:', req.user.userId);
      } else {
        console.log('❌ No userId found in decoded token. Available fields:', Object.keys(decoded));
        req.user = { userId: null };
      }
      
    } catch (jwtError) {
      console.log('❌ JWT verification failed:', jwtError.message);
      console.log('💡 JWT Error name:', jwtError.name);
      
      // Specific error handling
      if (jwtError.name === 'JsonWebTokenError') {
        console.log('🔑 This is likely a secret mismatch issue!');
      } else if (jwtError.name === 'TokenExpiredError') {
        console.log('⏰ Token has expired!');
      }
      
      req.user = { userId: null };
    }
    
    next();
  } catch (error) {
    console.log('💥 Auth middleware error:', error.message);
    req.user = { userId: null };
    next();
  }
};

module.exports = auth;