const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { success, created, error } = require('../utils/apiResponse');

const assertTaskAccess = async (taskId, user) => {
  const task = await Task.findById(taskId);
  if (!task) return { task: null, error: 'Task not found.' };

  const project = await Project.findById(task.project);
  if (!project) return { task: null, error: 'Project not found.' };

  const isMember = project.members.some((m) => m.toString() === user._id.toString());
  if (user.role !== 'admin' && !isMember) {
    return { task: null, error: 'Access denied.' };
  }

  return { task, error: null };
};

// ── GET /api/comments?task=:taskId ────────────────────────────────────────────
const getComments = async (req, res, next) => {
  try {
    const { task: taskId } = req.query;
    if (!taskId) return error(res, 'task query param is required.', 400);

    const { task, error: accessError } = await assertTaskAccess(taskId, req.user);
    if (accessError) {
      return error(res, accessError, accessError === 'Task not found.' ? 404 : 403);
    }

    const comments = await Comment.find({ task: task._id })
      .populate('author', 'name email avatar')
      .sort({ createdAt: 1 });

    return success(res, { comments });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/comments ────────────────────────────────────────────────────────
const createComment = async (req, res, next) => {
  try {
    const { body: body_, task: taskId } = req.body;

    const { task, error: accessError } = await assertTaskAccess(taskId, req.user);
    if (accessError) {
      return error(res, accessError, accessError === 'Task not found.' ? 404 : 403);
    }

    const comment = await Comment.create({
      body: body_,
      task: task._id,
      author: req.user._id,
    });

    await comment.populate('author', 'name email avatar');
    return created(res, { comment });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/comments/:id ───────────────────────────────────────────────────
const updateComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return error(res, 'Comment not found.', 404);

    // Only author or admin can edit
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return error(res, 'Only the comment author can edit this comment.', 403);
    }

    comment.body = req.body.body;
    await comment.save();
    await comment.populate('author', 'name email avatar');

    return success(res, { comment });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/comments/:id ──────────────────────────────────────────────────
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return error(res, 'Comment not found.', 404);

    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return error(res, 'Only the comment author can delete this comment.', 403);
    }

    await comment.deleteOne();
    return success(res, { message: 'Comment deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getComments, createComment, updateComment, deleteComment };
