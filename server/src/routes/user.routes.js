const express = require('express');
const { getAllUsers, getUserById, updateUser } = require('../controllers/user.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/', restrictTo('admin'), getAllUsers);
router.get('/:id', getUserById);
router.patch('/:id', updateUser);

module.exports = router;
