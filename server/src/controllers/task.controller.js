const Task = require('../models/Task');
const Project = require('../models/Project');
const Comment = require('../models/Comment');
const { success, created, error } = require('../utils/apiResponse');

/** Verify user has access to the project the task belongs to */
const getProjectAndAssertAccess = async (projectId, user) => {
  const project = await Project.findById(projectId);
  if (!project) return { project: null, denied: 'Project not found.' };

  const isMember = project.members.some((m) => m.toString() === user._id.toString());
  if (user.role !== 'admin' && !isMember) {
    return { project: null, denied: 'Access denied.' };
  }
  return { project, denied: null };
};

// ── POST /api/tasks ───────────────────────────────────────────────────────────
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, project: projectId, assignee, dueDate, tags } =
      req.body;

    const { project, denied } = await getProjectAndAssertAccess(projectId, req.user);
    if (denied) return error(res, denied, denied === 'Project not found.' ? 404 : 403);

    // If assigning, verify the assignee is a project member
    if (assignee) {
      const isMember = project.members.some((m) => m.toString() === assignee);
      if (!isMember) return error(res, 'Assignee must be a member of the project.', 400);
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      project: project._id,
      assignee: assignee || null,
      createdBy: req.user._id,
      dueDate: dueDate || null,
      tags: tags || [],
    });

    await task.populate([
      { path: 'assignee', select: 'name email avatar' },
      { path: 'createdBy', select: 'name email avatar' },
    ]);

    return created(res, { task });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/tasks?project=&status=&priority=&assignee=&search=&page=&limit= ──
const getTasks = async (req, res, next) => {
  try {
    const {
      project: projectId,
      status,
      priority,
      assignee,
      search,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    if (!projectId) return error(res, 'project query param is required.', 400);

    const { project, denied } = await getProjectAndAssertAccess(projectId, req.user);
    if (denied) return error(res, denied, denied === 'Project not found.' ? 404 : 403);

    const filter = { project: project._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee === 'me') {
      filter.assignee = req.user._id;
    } else if (assignee) {
      filter.assignee = assignee;
    }
    if (search) {
      filter.$text = { $search: search };
    }

    const allowedSorts = ['createdAt', 'updatedAt', 'priority', 'dueDate', 'title'];
    const sort = {};
    sort[allowedSorts.includes(sortBy) ? sortBy : 'createdAt'] = sortOrder === 'asc' ? 1 : -1;

    const skip = (Math.max(1, parseInt(page)) - 1) * Math.min(100, parseInt(limit));
    const take = Math.min(100, parseInt(limit));

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('assignee', 'name email avatar')
        .populate('createdBy', 'name email avatar')
        .sort(sort)
        .skip(skip)
        .limit(take),
      Task.countDocuments(filter),
    ]);

    return success(res, {
      tasks,
      pagination: {
        total,
        page: parseInt(page),
        limit: take,
        pages: Math.ceil(total / take),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/tasks/:id ────────────────────────────────────────────────────────
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name status');

    if (!task) return error(res, 'Task not found.', 404);

    const { denied } = await getProjectAndAssertAccess(task.project._id, req.user);
    if (denied) return error(res, 'Access denied.', 403);

    return success(res, { task });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/tasks/:id ──────────────────────────────────────────────────────
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return error(res, 'Task not found.', 404);

    const { project, denied } = await getProjectAndAssertAccess(task.project, req.user);
    if (denied) return error(res, 'Access denied.', 403);

    const { title, description, status, priority, assignee, dueDate, tags } = req.body;

    // Validate new assignee is a project member
    if (assignee !== undefined && assignee !== null) {
      const isMember = project.members.some((m) => m.toString() === assignee);
      if (!isMember) return error(res, 'Assignee must be a member of the project.', 400);
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (assignee !== undefined) updates.assignee = assignee || null;
    if (dueDate !== undefined) updates.dueDate = dueDate || null;
    if (tags !== undefined) updates.tags = tags;

    const updated = await Task.findByIdAndUpdate(task._id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    return success(res, { task: updated });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/tasks/:id ─────────────────────────────────────────────────────
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return error(res, 'Task not found.', 404);

    const { denied } = await getProjectAndAssertAccess(task.project, req.user);
    if (denied) return error(res, 'Access denied.', 403);

    // Only task creator, project owner, or admin may delete
    const project = await Project.findById(task.project);
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    if (!isOwner && !isCreator && req.user.role !== 'admin') {
      return error(res, 'Only the task creator or project owner can delete this task.', 403);
    }

    await Promise.all([
      task.deleteOne(),
      Comment.deleteMany({ task: task._id }),
    ]);

    return success(res, { message: 'Task deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createTask, getTasks, getTaskById, updateTask, deleteTask };
