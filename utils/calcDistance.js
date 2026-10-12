const axios = require('axios');
const AppError = require('./AppError');

exports.calculateDistanceAndTime = async (pickupLat, pickupLon, dropoffLat, dropoffLon) => {
  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${pickupLon},${pickupLat};${dropoffLon},${dropoffLat}?overview=full&geometries=geojson`;
  const response = await axios.get(osrmUrl);
  const route = response.data.routes?.[0];

  if (!route) {
    throw new AppError('Could not calculate a route for these points', 400);
  }
  const hours = Math.floor(route.duration / 3600);
  const minutes = Math.floor((route.duration % 3600) / 60);

  return {
    distanceInKm: route.distance / 1000,
    durationMinutes: route.duration / 60,
    geometry: route.geometry,
    hours,
    minutes,
    durationFormatted: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
  };
};
