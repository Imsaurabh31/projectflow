// Vercel serverless function - lives inside client/ (rootDirectory)
// Path back to server source: ../../server/src/index
require('dotenv').config();
const app = require('../../server/src/index');

module.exports = app;
