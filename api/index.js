// Vercel serverless entry point (lives at repo root /api/index.js)
require('dotenv').config();
const app = require('../server/src/index');

module.exports = app;
