// utils/generateToken.js
//
// WHAT: Generates a signed JWT token containing the user's ID.
// WHY: Centralizing token generation avoids repeating jwt.sign() logic
//      in multiple controllers and keeps the secret/expiry config in one place.

const jwt = require('jsonwebtoken');

/**
 * Generates a JWT for a given user ID.
 *
 * @param {String} userId - MongoDB ObjectId of the user
 * @returns {String} signed JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = generateToken;
