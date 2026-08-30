const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const { error } = require('../utils/apiResponse');

/**
 * Protect routes — verifies JWT and attaches req.user.
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'Not authenticated. Please log in.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return error(res, 'User belonging to this token no longer exists.', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return error(res, 'Invalid token.', 401);
    }
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Token expired. Please log in again.', 401);
    }
    next(err);
  }
};

/**
 * Restrict to specific roles. Use after protect.
 * e.g. restrictTo('admin')
 */
const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return error(res, 'You do not have permission to perform this action.', 403);
  }
  next();
};

module.exports = { protect, restrictTo };
