const { error } = require('../utils/apiResponse');

const notFound = (req, res, next) => {
  next({ statusCode: 404, message: `Route ${req.originalUrl} not found` });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with that ${field} already exists.`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for ${err.path}.`;
  }

  if (process.env.NODE_ENV !== 'test') {
    console.error('[Error]', statusCode, message, err.stack ? err.stack.split('\n')[1] : '');
  }

  return error(res, message, statusCode);
};

module.exports = { notFound, errorHandler };
