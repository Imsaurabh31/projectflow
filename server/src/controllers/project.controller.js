const mongoose = require('mongoose');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { success, created, error } = require('../utils/apiResponse');

/**
 * Helper: check if the requesting user is a member of the project.
 * Admins are allowed access to all projects.
 */
const assertAccess = (project, user) => {
  if (user.role === 'admin') return true;
  return project.members.some((m) => m.toString() === user._id.toString());
};

/**
 * Helper: check if user is the project owner or an admin.
 */
const assertOwnerOrAdmin = (project, user) => {
  if (user.role === 'admin') return true;
  return project.owner.toString() === user._id.toString();
};

// ── POST /api/projects ────────────────────────────────────────────────────────
const createProject = async (req, res, next) => {
  try {
    const { name, description, members } = req.body;

    // Validate member IDs if provided
    const memberIds = Array.isArray(members) ? members : [];

    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: memberIds,
    });

    await project.populate('owner members', 'name email avatar role');
    return created(res, { project });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/projects ─────────────────────────────────────────────────────────
const getProjects = async (req, res, next) => {
  try {
    const { status = 'active' } = req.query;
    const filter = {};

    // Admins see all; members see only projects they belong to
    if (req.user.role !== 'admin') {
      filter.members = req.user._id;
    }

    if (status && ['active', 'archived'].includes(status)) {
      filter.status = status;
    }

    const projects = await Project.find(filter)
      .populate('owner members', 'name email avatar role')
      .sort({ updatedAt: -1 });

    // Attach task summary counts via aggregation
    const projectIds = projects.map((p) => p._id);
    const taskStats = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      {
        $group: {
          _id: { project: '$project', status: '$status' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Build a lookup map { projectId -> { todo, in_progress, done, total } }
    const statsMap = {};
    taskStats.forEach(({ _id, count }) => {
      const pid = _id.project.toString();
      if (!statsMap[pid]) statsMap[pid] = { todo: 0, in_progress: 0, done: 0, total: 0 };
      statsMap[pid][_id.status] = count;
      statsMap[pid].total += count;
    });

    const enriched = projects.map((p) => {
      const obj = p.toObject();
      obj.taskStats = statsMap[p._id.toString()] || { todo: 0, in_progress: 0, done: 0, total: 0 };
      return obj;
    });

    return success(res, { projects: enriched });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/projects/:id ─────────────────────────────────────────────────────
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      'owner members',
      'name email avatar role'
    );
    if (!project) return error(res, 'Project not found.', 404);
    if (!assertAccess(project, req.user)) return error(res, 'Access denied.', 403);

    // Fetch task stats for this project
    const taskStats = await Task.aggregate([
      { $match: { project: project._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const stats = { todo: 0, in_progress: 0, done: 0, total: 0 };
    taskStats.forEach(({ _id, count }) => {
      stats[_id] = count;
      stats.total += count;
    });

    const obj = project.toObject();
    obj.taskStats = stats;

    return success(res, { project: obj });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/projects/:id ───────────────────────────────────────────────────
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return error(res, 'Project not found.', 404);
    if (!assertOwnerOrAdmin(project, req.user))
      return error(res, 'Only the project owner or an admin can edit this project.', 403);

    const allowed = ['name', 'description'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) project[field] = req.body[field];
    });

    await project.save();
    await project.populate('owner members', 'name email avatar role');
    return success(res, { project });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/projects/:id/archive ──────────────────────────────────────────
const archiveProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return error(res, 'Project not found.', 404);
    if (!assertOwnerOrAdmin(project, req.user))
      return error(res, 'Only the project owner or an admin can archive this project.', 403);

    project.status = project.status === 'archived' ? 'active' : 'archived';
    await project.save();
    await project.populate('owner members', 'name email avatar role');
    return success(res, { project });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/projects/:id/members ────────────────────────────────────────────
const addMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return error(res, 'Project not found.', 404);
    if (!assertOwnerOrAdmin(project, req.user)) return error(res, 'Forbidden.', 403);

    const { userId } = req.body;
    if (!userId) return error(res, 'userId is required.', 400);

    const uid = new mongoose.Types.ObjectId(userId);
    if (!project.members.some((m) => m.equals(uid))) {
      project.members.push(uid);
      await project.save();
    }

    await project.populate('owner members', 'name email avatar role');
    return success(res, { project });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/projects/:id/members/:userId ──────────────────────────────────
const removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return error(res, 'Project not found.', 404);
    if (!assertOwnerOrAdmin(project, req.user)) return error(res, 'Forbidden.', 403);

    const uid = req.params.userId;
    if (project.owner.toString() === uid) {
      return error(res, 'Cannot remove the project owner from members.', 400);
    }

    project.members = project.members.filter((m) => m.toString() !== uid);
    await project.save();
    await project.populate('owner members', 'name email avatar role');
    return success(res, { project });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/projects/:id/dashboard ──────────────────────────────────────────
const getProjectDashboard = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      'owner members',
      'name email avatar role'
    );
    if (!project) return error(res, 'Project not found.', 404);
    if (!assertAccess(project, req.user)) return error(res, 'Access denied.', 403);

    const [statusStats, priorityStats, assigneeStats, recentTasks] = await Promise.all([
      Task.aggregate([
        { $match: { project: project._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: { project: project._id } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: { project: project._id, assignee: { $ne: null } } },
        { $group: { _id: '$assignee', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $project: {
            count: 1,
            'user.name': 1,
            'user.email': 1,
            'user.avatar': 1,
          },
        },
      ]),
      Task.find({ project: project._id })
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate('assignee', 'name email avatar'),
    ]);

    const byStatus = { todo: 0, in_progress: 0, done: 0 };
    statusStats.forEach(({ _id, count }) => { byStatus[_id] = count; });

    const byPriority = { low: 0, medium: 0, high: 0, urgent: 0 };
    priorityStats.forEach(({ _id, count }) => { byPriority[_id] = count; });

    return success(res, {
      project,
      stats: {
        byStatus,
        byPriority,
        total: Object.values(byStatus).reduce((a, b) => a + b, 0),
        byAssignee: assigneeStats,
      },
      recentTasks,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  archiveProject,
  addMember,
  removeMember,
  getProjectDashboard,
};
