// utils/calculatePace.js
//
// WHAT: Calculates running pace (minutes per kilometer) and average speed (km/h).
// WHY: Keeps math logic separate from controllers, reusable across the app
//      (e.g. for a single run, or for aggregated statistics).

/**
 * Calculates pace in minutes per kilometer.
 *
 * @param {Number} distanceKm - total distance in kilometers
 * @param {Number} durationSeconds - total duration in seconds
 * @returns {Number} pace in minutes/km, rounded to 2 decimal places (0 if no distance)
 */
const calculatePace = (distanceKm, durationSeconds) => {
  if (!distanceKm || distanceKm <= 0) return 0;

  const durationMinutes = durationSeconds / 60;
  const pace = durationMinutes / distanceKm;

  return Math.round(pace * 100) / 100;
};

/**
 * Calculates average speed in kilometers per hour.
 *
 * @param {Number} distanceKm - total distance in kilometers
 * @param {Number} durationSeconds - total duration in seconds
 * @returns {Number} average speed in km/h, rounded to 2 decimal places (0 if no time)
 */
const calculateAverageSpeed = (distanceKm, durationSeconds) => {
  if (!durationSeconds || durationSeconds <= 0) return 0;

  const durationHours = durationSeconds / 3600;
  const speed = distanceKm / durationHours;

  return Math.round(speed * 100) / 100;
};

module.exports = {
  calculatePace,
  calculateAverageSpeed,
};
