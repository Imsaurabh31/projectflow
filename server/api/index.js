// Vercel serverless entry point
// Vercel looks for api/index.js and runs it as a serverless function
require('dotenv').config();
const app = require('../src/index');

module.exports = app;
