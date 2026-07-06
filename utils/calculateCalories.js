// utils/calculateCalories.js
//
// WHAT: Provides a simple, reusable formula to estimate calories burned
//       during a run, based on the runner's body weight, distance, and time.
// WHY: This is a common academic-project-friendly approximation. It keeps
//      the "business logic" of calorie estimation out of the controller.
//
// FORMULA USED (simple MET-based approximation):
//   Calories = MET * weight(kg) * duration(hours)
//   We derive an approximate MET value based on running speed (km/h),
//   which is a widely used simplification in fitness apps for academic use.

/**
 * Returns an approximate MET (Metabolic Equivalent of Task) value based on
 * running speed. Faster speed -> higher MET -> more calories burned per hour.
 *
 * These thresholds are simplified approximations commonly used in
 * fitness/calorie calculators (based on Compendium of Physical Activities).
 *
 * @param {Number} speedKmh - average speed in km/h
 * @returns {Number} MET value
 */
const getMetValue = (speedKmh) => {
  if (speedKmh < 6) return 6; // brisk walk / very slow jog
  if (speedKmh < 8) return 8.3; // light jog
  if (speedKmh < 9.7) return 9.8; // moderate run
  if (speedKmh < 11.3) return 11; // fast run
  if (speedKmh < 12.9) return 11.8; // faster run
  if (speedKmh < 16) return 12.8; // very fast run
  return 14.5; // sprinting pace
};

/**
 * Estimates calories burned during a run.
 *
 * @param {Number} weightKg - runner's body weight in kilograms (defaults to 70kg if not provided)
 * @param {Number} distanceKm - total distance covered in kilometers
 * @param {Number} durationSeconds - total duration of the run in seconds
 * @returns {Number} estimated calories burned, rounded to nearest whole number
 */
const calculateCalories = (weightKg, distanceKm, durationSeconds) => {
  if (!durationSeconds || durationSeconds <= 0 || !distanceKm || distanceKm <= 0) {
    return 0;
  }

  // Default to an average adult weight if user hasn't provided one in their profile.
  const weight = weightKg && weightKg > 0 ? weightKg : 70;

  const durationHours = durationSeconds / 3600;
  const speedKmh = distanceKm / durationHours;

  const met = getMetValue(speedKmh);

  const calories = met * weight * durationHours;

  return Math.round(calories);
};

module.exports = calculateCalories;
