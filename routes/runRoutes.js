// routes/runRoutes.js
//
// WHAT: Defines all /api/runs/* endpoints for starting, tracking, stopping,
//       listing, viewing, deleting runs, and fetching statistics.
// WHY: Every route here is protected — you must be logged in to track runs.
//
// IMPORTANT ORDERING NOTE:
// The '/statistics' route MUST be declared BEFORE the '/:id' route.
// Otherwise Express would treat "statistics" as a value for the :id
// parameter and send it to getRunById instead of getStatistics.

const express = require('express');
const router = express.Router();

const {
  startRun,
  addLocation,
  stopRun,
  getRuns,
  getRunById,
  deleteRun,
  getStatistics,
} = require('../controllers/runController');

const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  addLocationValidator,
  stopRunValidator,
  runIdParamValidator,
} = require('../validators/runValidator');

// All run routes require the user to be logged in
router.use(protect);

// @route   POST /api/runs/start
router.post('/start', startRun);

// @route   POST /api/runs/location
router.post('/location', addLocationValidator, validate, addLocation);

// @route   POST /api/runs/stop
router.post('/stop', stopRunValidator, validate, stopRun);

// @route   GET /api/runs/statistics  (must come before /:id)
router.get('/statistics', getStatistics);

// @route   GET /api/runs
router.get('/', getRuns);

// @route   GET /api/runs/:id
router.get('/:id', runIdParamValidator, validate, getRunById);

// @route   DELETE /api/runs/:id
router.delete('/:id', runIdParamValidator, validate, deleteRun);

module.exports = router;
