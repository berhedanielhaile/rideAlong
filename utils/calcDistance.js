const axios = require('axios');
const AppError = require('./AppError');

const toRad = (value) => (value * Math.PI) / 180;

const haversineKm = (pickupLat, pickupLon, dropoffLat, dropoffLon) => {
  const earthKm = 6371;
  const dLat = toRad(dropoffLat - pickupLat);
  const dLon = toRad(dropoffLon - pickupLon);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(pickupLat)) * Math.cos(toRad(dropoffLat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return earthKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const fallbackRoute = (pickupLat, pickupLon, dropoffLat, dropoffLon) => {
  const distanceInKm = haversineKm(pickupLat, pickupLon, dropoffLat, dropoffLon) * 1.25;
  const durationMinutes = Math.max(4, (distanceInKm / 22) * 60);
  const hours = Math.floor(durationMinutes / 60);
  const minutes = Math.floor(durationMinutes % 60);
  return {
    distanceInKm,
    durationMinutes,
    geometry: {
      type: 'LineString',
      coordinates: [
        [pickupLon, pickupLat],
        [dropoffLon, dropoffLat],
      ],
    },
    hours,
    minutes,
    durationFormatted: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
    fallback: true,
  };
};

exports.calculateDistanceAndTime = async (pickupLat, pickupLon, dropoffLat, dropoffLon) => {
  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${pickupLon},${pickupLat};${dropoffLon},${dropoffLat}?overview=simplified&geometries=geojson`;
  try {
    const response = await axios.get(osrmUrl, { timeout: 5000 });
    const route = response.data.routes?.[0];
    if (!route) return fallbackRoute(pickupLat, pickupLon, dropoffLat, dropoffLon);

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
  } catch (error) {
    if (error instanceof AppError) throw error;
    return fallbackRoute(pickupLat, pickupLon, dropoffLat, dropoffLon);
  }
};
