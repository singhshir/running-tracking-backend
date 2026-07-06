// validators/runValidator.js
//
// WHAT: express-validator rule sets for all run-tracking related routes.
// WHY: Ensures GPS coordinates and run data are within valid ranges
//      before they ever reach the controller or database.

const { body, param } = require('express-validator');

// Rules for POST /api/runs/location
const addLocationValidator = [
  body('runId').notEmpty().withMessage('runId is required').isMongoId().withMessage('runId must be a valid ID'),

  body('latitude')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('longitude')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  body('timestamp').optional().isISO8601().withMessage('Timestamp must be a valid date'),
];

// Rules for POST /api/runs/stop
const stopRunValidator = [
  body('runId').notEmpty().withMessage('runId is required').isMongoId().withMessage('runId must be a valid ID'),
];

// Rules for routes with an :id param (GET /api/runs/:id, DELETE /api/runs/:id)
const runIdParamValidator = [
  param('id').isMongoId().withMessage('Invalid run ID'),
];

module.exports = {
  addLocationValidator,
  stopRunValidator,
  runIdParamValidator,
};
