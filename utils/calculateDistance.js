// utils/calculateDistance.js
//
// WHAT: Calculates the distance between two GPS coordinates using the
//       Haversine formula, and a helper to sum up the total distance
//       for a full array of route coordinates.
// WHY: Distance calculation is pure math/business logic. Keeping it out of
//      controllers makes controllers thinner and this logic reusable/testable.

/**
 * Converts degrees to radians.
 * @param {Number} degrees
 * @returns {Number} radians
 */
const toRadians = (degrees) => (degrees * Math.PI) / 180;

/**
 * Calculates the distance (in kilometers) between two lat/lng points
 * using the Haversine formula.
 *
 * @param {Number} lat1 - Latitude of point 1
 * @param {Number} lon1 - Longitude of point 1
 * @param {Number} lat2 - Latitude of point 2
 * @param {Number} lon2 - Longitude of point 2
 * @returns {Number} distance in kilometers
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const EARTH_RADIUS_KM = 6371; // Mean radius of the Earth in km

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c; // distance in km
};

/**
 * Calculates the total distance covered across an entire route by summing
 * the Haversine distance between each consecutive pair of coordinates.
 *
 * @param {Array} routeCoordinates - Array of { latitude, longitude, timestamp }
 * @returns {Number} total distance in kilometers, rounded to 2 decimal places
 */
const calculateTotalDistance = (routeCoordinates) => {
  if (!Array.isArray(routeCoordinates) || routeCoordinates.length < 2) {
    return 0;
  }

  let totalDistance = 0;

  for (let i = 1; i < routeCoordinates.length; i++) {
    const prev = routeCoordinates[i - 1];
    const curr = routeCoordinates[i];

    totalDistance += haversineDistance(
      prev.latitude,
      prev.longitude,
      curr.latitude,
      curr.longitude
    );
  }

  return Math.round(totalDistance * 100) / 100; // round to 2 decimal places
};

module.exports = {
  haversineDistance,
  calculateTotalDistance,
};
