// middleware/errorMiddleware.js
//
// WHAT: Provides two pieces of middleware:
//       1. notFound      - catches requests to routes that don't exist (404)
//       2. errorHandler   - a global "catch-all" error handler for the whole app
// WHY: Instead of repeating try/catch error formatting in every controller,
//      we throw/pass errors to next(error) and let this middleware format
//      the final JSON response consistently.
// FLOW: Express automatically calls error-handling middleware (functions with
//       4 params: err, req, res, next) whenever next(error) is called, or
//       when an error is thrown inside an async route wrapped properly.

// ---------------------------------------------------------------------------
// 404 Handler — runs when no route matched the request.
// Must be registered AFTER all other routes in app.js.
// ---------------------------------------------------------------------------
const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error); // forward to errorHandler below
};

// ---------------------------------------------------------------------------
// Global Error Handler — the last middleware in the chain.
// Formats ALL errors (thrown manually, from Mongoose, from JWT, etc.)
// into our consistent { success, message, data } JSON shape.
// ---------------------------------------------------------------------------
const errorHandler = (err, req, res, next) => {
  // If a status code was already set (e.g. 404 from notFound), use it.
  // Otherwise, default to 500 (Internal Server Error).
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle a specific Mongoose error: invalid ObjectId format (e.g. bad :id param)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found (invalid ID)';
  }

  // Handle Mongoose duplicate key error (e.g. registering with an existing email)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for field: ${field}`;
  }

  // Handle Mongoose validation errors (e.g. missing required field)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    // Only include the stack trace in development mode for easier debugging
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
