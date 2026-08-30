const express = require('express');
const { body, param } = require('express-validator');
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  archiveProject,
  addMember,
  removeMember,
  getProjectDashboard,
} = require('../controllers/project.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

router.use(protect);

router.get('/', getProjects);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Project name is required').isLength({ max: 120 }),
    body('description').optional().trim().isLength({ max: 1000 }),
    body('members').optional().isArray(),
  ],
  validate,
  createProject
);

router.get('/:id', getProjectById);
router.get('/:id/dashboard', getProjectDashboard);

router.patch(
  '/:id',
  [
    body('name').optional().trim().notEmpty().isLength({ max: 120 }),
    body('description').optional().trim().isLength({ max: 1000 }),
  ],
  validate,
  updateProject
);

router.patch('/:id/archive', archiveProject);

router.post(
  '/:id/members',
  [body('userId').notEmpty().withMessage('userId is required')],
  validate,
  addMember
);

router.delete('/:id/members/:userId', removeMember);

module.exports = router;
