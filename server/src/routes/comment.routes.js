const express = require('express');
const { body, query } = require('express-validator');
const { getComments, createComment, updateComment, deleteComment } =
  require('../controllers/comment.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

router.use(protect);

router.get(
  '/',
  [query('task').notEmpty().withMessage('task query param is required')],
  validate,
  getComments
);

router.post(
  '/',
  [
    body('body').trim().notEmpty().withMessage('Comment body is required').isLength({ max: 2000 }),
    body('task').notEmpty().withMessage('task ID is required').isMongoId(),
  ],
  validate,
  createComment
);

router.patch(
  '/:id',
  [body('body').trim().notEmpty().withMessage('Comment body is required').isLength({ max: 2000 })],
  validate,
  updateComment
);

router.delete('/:id', deleteComment);

module.exports = router;
