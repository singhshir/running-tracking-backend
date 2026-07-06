

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const runRoutes = require('./routes/runRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// ---------------------------------------------------------------------------
// GLOBAL MIDDLEWARE
// ---------------------------------------------------------------------------

// Security: sets various HTTP headers to help protect against common attacks
app.use(helmet());

// CORS: allows our React frontend (running on a different origin/port)
// to make requests to this API, and allows cookies to be sent cross-origin.
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Logging: logs every incoming request to the console (helpful for debugging)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsers: allow Express to understand JSON and cookies in requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files (e.g. profile images) statically
app.use('/uploads', express.static('uploads'));

// ---------------------------------------------------------------------------
// ROUTES
// ---------------------------------------------------------------------------

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Real-Time Running Tracker API. See /api/health for status.',
    data: null,
  });
});

// Simple health-check route — useful to confirm the API is running
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Real-Time Running Tracker API is up and running',
    data: null,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/runs', runRoutes);

// ---------------------------------------------------------------------------
// ERROR HANDLING (must be registered LAST)
// ---------------------------------------------------------------------------
app.use(notFound); // catches unmatched routes -> 404
app.use(errorHandler); // catches all errors thrown/passed via next(error)

module.exports = app;
