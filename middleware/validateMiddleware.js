// middleware/validateMiddleware.js
//
// WHAT: A reusable middleware that checks whether express-validator found
//       any validation errors on the request, and if so, stops the request
//       and returns a clean error response.
// WHY: Instead of repeating "check for errors" logic in every controller,
//      every route runs its validator array + this single middleware.
// FLOW: routes/*.js -> [validators...] -> validate -> controller

const { validationResult } = require('express-validator');
const { sendError } = require('../utils/responseHandler');

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Collect all validation error messages into a single readable string
    const messages = errors.array().map((err) => err.msg);
    return sendError(res, 400, messages.join(', '), errors.array());
  }

  next();
};

module.exports = validate;
