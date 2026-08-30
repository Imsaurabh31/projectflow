const User = require('../models/User');
const { success, error } = require('../utils/apiResponse');

// GET /api/users  — admin only, list all users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return success(res, { users });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return error(res, 'User not found.', 404);
    return success(res, { user });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/:id  — user can update own profile; admin can update anyone
const updateUser = async (req, res, next) => {
  try {
    const isOwnProfile = req.user._id.toString() === req.params.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwnProfile && !isAdmin) {
      return error(res, 'Forbidden.', 403);
    }

    const allowed = ['name', 'avatar'];
    // Admins can also change roles
    if (isAdmin) allowed.push('role');

    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!user) return error(res, 'User not found.', 404);

    return success(res, { user });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, getUserById, updateUser };
