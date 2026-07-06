// config/db.js
//
// WHAT: Sets up and exports a function that connects our backend to MongoDB.
// WHY: Keeping DB connection logic in its own file keeps server.js clean
//      and makes it easy to reuse/extend (e.g. add connection event listeners).
// FLOW: server.js calls connectDB() once on startup -> mongoose connects
//       using the MONGO_URI from our .env file -> logs success/failure.

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // process.env.MONGO_URI is loaded from the .env file via dotenv (see server.js)
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Exit the process with failure if we can't connect to the DB.
    // There's no point running an API server that can't reach its database.
    process.exit(1);
  }
};

module.exports = connectDB;
