const User = require('../models/User');
const { signToken } = require('../utils/jwt');
const { success, created, error } = require('../utils/apiResponse');

const sendAuthResponse = (res, user, statusCode = 200) => {
  const token = signToken({ id: user._id, role: user.role });
  const respond = statusCode === 201 ? created : success;
  return respond(res, { token, user }, statusCode);
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return error(res, 'An account with that email already exists.', 409);
    }

    // Only allow admin role if explicitly set AND caller is an admin (handled by route)
    const safeRole = role === 'admin' ? 'admin' : 'member';

    const user = await User.create({ name, email, password, role: safeRole });
    return sendAuthResponse(res, user, 201);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return error(res, 'Invalid email or password.', 401);
    }

    return sendAuthResponse(res, user);
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me  (protected)
const getMe = async (req, res) => {
  return success(res, { user: req.user });
};

module.exports = { register, login, getMe };
