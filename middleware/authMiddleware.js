// middleware/authMiddleware.js
//
// WHAT: Protects private routes by verifying a JWT token before letting
//       the request continue to the controller.
// WHY: We don't want unauthenticated users to access things like
//      "my profile" or "my runs". This middleware checks the token,
//      decodes it, finds the matching user, and attaches it to req.user.
// FLOW: Client sends token (via cookie or Authorization header)
//       -> middleware verifies it -> attaches user to req -> next()
//       -> if invalid/missing, respond with 401 Unauthorized.

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/responseHandler');

const protect = async (req, res, next) => {
  let token;

  // 1. Try to get the token from the Authorization header: "Bearer <token>"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2. Fallback: try to get the token from cookies (set during login)
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // 3. If no token was found at all, block the request
  if (!token) {
    return sendError(res, 401, 'Not authorized, no token provided');
  }

  try {
    // 4. Verify the token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Find the user belonging to this token and attach it to the request
    //    (excluding the password field, which is already select:false by default)
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return sendError(res, 401, 'Not authorized, user no longer exists');
    }

    // 6. All good — move on to the actual controller
    next();
  } catch (error) {
    return sendError(res, 401, 'Not authorized, token failed or expired');
  }
};

module.exports = { protect };
