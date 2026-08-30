const express = require('express');
const { body, query } = require('express-validator');
const { createTask, getTasks, getTaskById, updateTask, deleteTask } =
  require('../controllers/task.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const STATUSES = ['todo', 'in_progress', 'done'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const router = express.Router();

router.use(protect);

router.get(
  '/',
  [
    query('project').notEmpty().withMessage('project is required'),
    query('status').optional().isIn(STATUSES),
    query('priority').optional().isIn(PRIORITIES),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  getTasks
);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
    body('description').optional().trim().isLength({ max: 2000 }),
    body('status').optional().isIn(STATUSES).withMessage(`Status must be one of: ${STATUSES.join(', ')}`),
    body('priority').optional().isIn(PRIORITIES),
    body('project').notEmpty().withMessage('project ID is required').isMongoId(),
    body('assignee').optional({ nullable: true }).isMongoId(),
    body('dueDate').optional({ nullable: true }).isISO8601(),
    body('tags').optional().isArray(),
  ],
  validate,
  createTask
);

router.get('/:id', getTaskById);

router.patch(
  '/:id',
  [
    body('title').optional().trim().notEmpty().isLength({ max: 200 }),
    body('description').optional().trim().isLength({ max: 2000 }),
    body('status').optional().isIn(STATUSES),
    body('priority').optional().isIn(PRIORITIES),
    body('assignee').optional({ nullable: true }).isMongoId(),
    body('dueDate').optional({ nullable: true }).isISO8601(),
    body('tags').optional().isArray(),
  ],
  validate,
  updateTask
);

router.delete('/:id', deleteTask);

module.exports = router;
