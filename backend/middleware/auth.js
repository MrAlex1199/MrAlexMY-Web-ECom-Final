import jwt from 'jsonwebtoken';
import chalk from 'chalk';

// Middleware to verify JWT token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token is required' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error(chalk.red('Token verification failed:', err.message));
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    
    req.user = user;
    next();
  });
};

// Middleware to verify admin role
export const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token is required' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error(chalk.red('Admin token verification failed:', err.message));
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }

    // Check if user has admin role (any admin role, not just 'admin')
    const adminRoles = [
      'Admin (Owner Master ID)',
      'Seller',
      'Warehouse Manager', 
      'Marketing Specialist',
      'Customer Support Agent',
      'Finance Analyst',
      'Content Creator',
      'Developer (Junior)',
      'Data Entry Clerk',
      'Logistics Coordinator'
    ];

    if (!user.role || !adminRoles.includes(user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }
    
    req.user = user;
    next();
  });
};

// Middleware to optionally authenticate (for endpoints that work with or without auth)
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  });
};

// Middleware to check specific permission
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    // Check if user has the required permission
    if (!req.user.permissions || 
        (!req.user.permissions.includes('all') && !req.user.permissions.includes(permission))) {
      return res.status(403).json({ 
        success: false, 
        message: `Permission '${permission}' required` 
      });
    }

    next();
  };
};

// Middleware to check if user can manage other users (for user management endpoints)
export const requireUserManagement = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }

  // Only Owner Master ID can manage users
  if (!req.user.permissions || !req.user.permissions.includes('all')) {
    return res.status(403).json({ 
      success: false, 
      message: 'User management permission required' 
    });
  }

  next();
};