const buildRouteEstimate = (routeData = {}) => {
  const distanceKm = Number(routeData.distanceInKm) || 0;
  const durationSeconds = Math.round((Number(routeData.durationMinutes) || 0) * 60);
  const route =
    routeData.geometry && Array.isArray(routeData.geometry.coordinates)
      ? routeData.geometry
      : { type: 'LineString', coordinates: [] };

  return {
    distance_km: Number(distanceKm.toFixed(2)),
    duration_seconds: durationSeconds,
    estimated_distance_km: Number(distanceKm.toFixed(2)),
    estimated_duration_seconds: durationSeconds,
    route,
  };
};

module.exports = { buildRouteEstimate };
