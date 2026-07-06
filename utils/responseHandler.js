// utils/responseHandler.js
//
// WHAT: Provides small helper functions to send consistent JSON responses
//       in the shape: { success, message, data }.
// WHY: Every API in this project should return the same response shape.
//      Centralizing this avoids typos/inconsistency across controllers.

/**
 * Sends a successful JSON response.
 *
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code (default 200)
 * @param {String} message - human-readable success message
 * @param {*} data - payload to return to the client (default null)
 */
const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Sends an error JSON response.
 *
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code (default 500)
 * @param {String} message - human-readable error message
 * @param {*} data - optional extra error details (default null)
 */
const sendError = (res, statusCode = 500, message = 'Something went wrong', data = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data,
  });
};

module.exports = {
  sendSuccess,
  sendError,
};
