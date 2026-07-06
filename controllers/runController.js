// controllers/runController.js
//
// WHAT: Handles all logic related to running sessions — starting a run,
//       recording live GPS points, stopping a run (with final calculations),
//       listing runs, viewing a single run, deleting a run, and aggregate
//       statistics.
// WHY: This is the core feature of the app. Keeping all run-related logic
//      here (while delegating actual math to utils/) keeps things organized.

const Run = require('../models/Run');
const { calculateTotalDistance } = require('../utils/calculateDistance');
const { calculatePace, calculateAverageSpeed } = require('../utils/calculatePace');
const calculateCalories = require('../utils/calculateCalories');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// -----------------------------------------------------------------------------
// @desc    Start a new running session
// @route   POST /api/runs/start
// @access  Private
//
// WHAT IT DOES: Creates a new Run document with status "active" and the
//               current time as startTime.
// WHY IT EXISTS: Marks the beginning of a run so the frontend can start
//                sending live GPS coordinates tied to this run's ID.
// FLOW: authMiddleware attaches req.user -> create Run with user + startTime
//       -> respond with the new run's ID
// -----------------------------------------------------------------------------
const startRun = async (req, res, next) => {
  try {
    const run = await Run.create({
      user: req.user._id,
      startTime: new Date(),
      status: 'active',
    });

    return sendSuccess(res, 201, 'Run started successfully', {
      runId: run._id,
      run,
    });
  } catch (error) {
    next(error);
  }
};


const addLocation = async (req, res, next) => {
  try {
    const { runId, latitude, longitude, timestamp } = req.body;

    const run = await Run.findOne({ _id: runId, user: req.user._id });

    if (!run) {
      return sendError(res, 404, 'Run not found');
    }

    if (run.status !== 'active') {
      return sendError(res, 400, 'Cannot add location to a run that is not active');
    }

    run.routeCoordinates.push({
      latitude,
      longitude,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    });

    await run.save();

    return sendSuccess(res, 200, 'Location added successfully', {
      totalPoints: run.routeCoordinates.length,
    });
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------------------
// @desc    Stop an active run and calculate final stats
// @route   POST /api/runs/stop
// @access  Private
//
// WHAT IT DOES: Marks the run as "completed", sets endTime, and calculates
//               duration, distance, average speed, average pace, and calories.
// WHY IT EXISTS: This is where all the "business logic" utility functions
//                come together to turn raw GPS data into meaningful stats.
// FLOW: find run (must belong to user & be active) -> set endTime & duration
//       -> calculate distance (Haversine) -> calculate pace & speed
//       -> calculate calories (using user's weight if available) -> save
// -----------------------------------------------------------------------------
const stopRun = async (req, res, next) => {
  try {
    const { runId, notes, weather } = req.body;

    const run = await Run.findOne({ _id: runId, user: req.user._id });

    if (!run) {
      return sendError(res, 404, 'Run not found');
    }

    if (run.status !== 'active') {
      return sendError(res, 400, 'This run has already been stopped');
    }

    const endTime = new Date();
    const durationSeconds = Math.round((endTime - run.startTime) / 1000);

    const distanceKm = calculateTotalDistance(run.routeCoordinates);
    const averagePace = calculatePace(distanceKm, durationSeconds);
    const averageSpeed = calculateAverageSpeed(distanceKm, durationSeconds);

    // req.user.weight comes from the logged-in user's profile (may be null,
    // in which case calculateCalories() falls back to a default weight)
    const calories = calculateCalories(req.user.weight, distanceKm, durationSeconds);

    run.endTime = endTime;
    run.duration = durationSeconds;
    run.distance = distanceKm;
    run.averagePace = averagePace;
    run.averageSpeed = averageSpeed;
    run.calories = calories;
    run.status = 'completed';
    if (notes) run.notes = notes;
    if (weather) run.weather = weather;

    await run.save();

    return sendSuccess(res, 200, 'Run stopped and stats calculated successfully', run);
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------------------
// @desc    Get all runs belonging to the logged-in user
// @route   GET /api/runs
// @access  Private
//
// WHAT IT DOES: Returns every run for the current user, newest first.
// WHY IT EXISTS: Powers the "run history" screen on the frontend.
// FLOW: find runs where user = req.user._id -> sort by createdAt descending
// -----------------------------------------------------------------------------
const getRuns = async (req, res, next) => {
  try {
    const runs = await Run.find({ user: req.user._id }).sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Runs fetched successfully', runs);
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------------------
// @desc    Get full details of a single run
// @route   GET /api/runs/:id
// @access  Private
//
// WHAT IT DOES: Returns one specific run (including its full route),
//               but only if it belongs to the logged-in user.
// WHY IT EXISTS: Powers a "run details" screen showing the map route & stats.
// FLOW: validate :id -> find run by id + user -> respond or 404
// -----------------------------------------------------------------------------
const getRunById = async (req, res, next) => {
  try {
    const run = await Run.findOne({ _id: req.params.id, user: req.user._id });

    if (!run) {
      return sendError(res, 404, 'Run not found');
    }

    return sendSuccess(res, 200, 'Run fetched successfully', run);
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------------------
// @desc    Delete a run
// @route   DELETE /api/runs/:id
// @access  Private
//
// WHAT IT DOES: Deletes a single run, but only if it belongs to the
//               logged-in user.
// WHY IT EXISTS: Lets users clean up accidental/test runs from their history.
// FLOW: validate :id -> find & delete run by id + user -> respond or 404
// -----------------------------------------------------------------------------
const deleteRun = async (req, res, next) => {
  try {
    const run = await Run.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!run) {
      return sendError(res, 404, 'Run not found');
    }

    return sendSuccess(res, 200, 'Run deleted successfully');
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------------------
// @desc    Get aggregate running statistics for the logged-in user
// @route   GET /api/runs/statistics
// @access  Private
//
// WHAT IT DOES: Computes overall stats across all of the user's COMPLETED
//               runs: total runs, total distance, total time, longest run,
//               average pace, average speed, total calories, and distance
//               for the current week / current month.
// WHY IT EXISTS: Powers a "dashboard" or "stats" screen so users can see
//                their overall progress, not just individual runs.
// FLOW: fetch all completed runs for user -> reduce/aggregate stats in JS
//       (simple & beginner-friendly, avoids complex aggregation pipelines)
// -----------------------------------------------------------------------------
const getStatistics = async (req, res, next) => {
  try {
    const runs = await Run.find({ user: req.user._id, status: 'completed' });

    if (runs.length === 0) {
      return sendSuccess(res, 200, 'No completed runs yet', {
        totalRuns: 0,
        totalDistance: 0,
        totalTime: 0,
        longestRun: 0,
        averagePace: 0,
        averageSpeed: 0,
        totalCalories: 0,
        currentMonthDistance: 0,
        currentWeekDistance: 0,
      });
    }

    // --- Basic totals ---
    const totalRuns = runs.length;
    const totalDistance = runs.reduce((sum, run) => sum + run.distance, 0);
    const totalTime = runs.reduce((sum, run) => sum + run.duration, 0);
    const totalCalories = runs.reduce((sum, run) => sum + run.calories, 0);
    const longestRun = Math.max(...runs.map((run) => run.distance));

    // --- Averages (based on totals for consistency, not average-of-averages) ---
    const averagePace = calculatePace(totalDistance, totalTime);
    const averageSpeed = calculateAverageSpeed(totalDistance, totalTime);

    // --- Date-range helpers for "this week" / "this month" ---
    const now = new Date();

    // Start of the current month (1st day, 00:00:00)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Start of the current week (Sunday as the first day, 00:00:00)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const currentMonthDistance = runs
      .filter((run) => run.createdAt >= startOfMonth)
      .reduce((sum, run) => sum + run.distance, 0);

    const currentWeekDistance = runs
      .filter((run) => run.createdAt >= startOfWeek)
      .reduce((sum, run) => sum + run.distance, 0);

    return sendSuccess(res, 200, 'Statistics fetched successfully', {
      totalRuns,
      totalDistance: Math.round(totalDistance * 100) / 100,
      totalTime,
      longestRun: Math.round(longestRun * 100) / 100,
      averagePace,
      averageSpeed,
      totalCalories,
      currentMonthDistance: Math.round(currentMonthDistance * 100) / 100,
      currentWeekDistance: Math.round(currentWeekDistance * 100) / 100,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startRun,
  addLocation,
  stopRun,
  getRuns,
  getRunById,
  deleteRun,
  getStatistics,
};
