// Root-level Vercel serverless function entry point
// Vercel picks up all files inside /api at the project root
require('dotenv').config();
const app = require('../server/src/index');

module.exports = app;
