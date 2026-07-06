// models/Run.js
//
// WHAT: Defines the Mongoose schema/model for a single running Session (Run).
// WHY: Stores every running session a user starts, including the live GPS
//      route, and the final calculated stats once the run is stopped.

const mongoose = require('mongoose');

// Sub-schema for a single GPS coordinate point along the route.
// We don't give this its own model since it only ever exists embedded
// inside a Run document.
const coordinateSchema = new mongoose.Schema(
  {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false } // no need for a separate _id on every coordinate
);

const runSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number, // duration in seconds
      default: 0,
    },
    distance: {
      type: Number, // distance in kilometers
      default: 0,
    },
    averageSpeed: {
      type: Number, // km/h
      default: 0,
    },
    averagePace: {
      type: Number, // minutes per km
      default: 0,
    },
    calories: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
    routeCoordinates: {
      type: [coordinateSchema],
      default: [],
    },
    weather: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// Index to make fetching "all runs for a user, newest first" fast.
runSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Run', runSchema);
