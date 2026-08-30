require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');

const connectDB = require('./config/db');
const authRoutes    = require('./routes/auth.routes');
const userRoutes    = require('./routes/user.routes');
const projectRoutes = require('./routes/project.routes');
const taskRoutes    = require('./routes/task.routes');
const commentRoutes = require('./routes/comment.routes');
const { errorHandler, notFound } = require('./middleware/error.middleware');

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── DB connection (cached for serverless) ─────────────────────
let isConnected = false;
app.use(async (_req, _res, next) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  next();
});

// ── Routes ────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth',     authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks',    taskRoutes);
app.use('/api/comments', commentRoutes);

// ── Error handling ────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Local dev server ──────────────────────────────────────────
if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  connectDB()
    .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
    .catch((err) => { console.error('DB connection failed:', err.message); process.exit(1); });
}

module.exports = app;
