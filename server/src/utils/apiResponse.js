/**
 * Consistent API response helpers.
 */

const success = (res, data, statusCode = 200) =>
  res.status(statusCode).json({ success: true, data });

const created = (res, data) => success(res, data, 201);

const error = (res, message, statusCode = 400, errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

module.exports = { success, created, error };
