const { validationResult } = require('express-validator');
const { error } = require('../utils/apiResponse');

/**
 * Runs after express-validator chains.
 * Short-circuits with 400 if there are validation errors.
 */
const validate = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return error(
      res,
      'Validation failed',
      400,
      result.array().map((e) => ({ field: e.path, message: e.msg }))
    );
  }
  next();
};

module.exports = validate;
