// server.js
//
// WHAT: The actual entry point of our backend. Loads environment variables,
//       connects to MongoDB, and starts the Express server listening on a port.
// WHY: Keeping this separate from app.js follows production-style structure
//      and makes app.js reusable/testable without side effects.

// Load environment variables from .env into process.env FIRST,
// before anything else tries to read them.
require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start listening for requests.
// We only want the server to start accepting traffic once the DB is ready.
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
});

// Catch any unhandled promise rejections (e.g. a DB query that fails
// somewhere without a try/catch) so the process doesn't crash silently.
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  process.exit(1);
});
