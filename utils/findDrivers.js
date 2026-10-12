const User = require('../model/user-Model');

const radiusMeters = Number(process.env.SEARCH_RADIUS_METERS) || 8000;
const maxDrivers = Number(process.env.MAX_NEARBY_DRIVERS) || 15;
// Find available drivers near a GeoJSON point.
exports.findNearbyDrivers = async (lng, lat, searchRadius) => {
  return User.aggregate([
    {
      // $geoNear must be the first aggregation stage and needs a 2dsphere index.
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [Number(lng), Number(lat)],
        },
        distanceField: 'distanceMeters',
        maxDistance: searchRadius || radiusMeters,
        spherical: true,
        query: {
          role: 'driver',
          'driverProfile.status': 'available',
        },
        //`key` is required because User also has a 2dsphere index on saved places.
        key: 'driverProfile.current_location',
      },
    },

    { $limit: maxDrivers },
    {
      $project: {
        name: 1,
        photo: 1,
        'driverProfile.rating': 1,
        'driverProfile.active_vehicle.ride_type': 1,
        'driverProfile.active_vehicle.model': 1,
        'driverProfile.active_vehicle.color': 1,
        'driverProfile.current_location': 1,
        distanceMeters: 1,
      },
    },
  ]);
};

exports.envNumber = (name) => {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : 0;
};

exports.calcFare = (distanceKm, durationMinutes, rates) => {
  const fareInDistance = Number((rates.perKm * distanceKm).toFixed(2));
  const fareInTime = Number((rates.perMinute * durationMinutes).toFixed(2));
  const total = Number((rates.baseFare + fareInDistance + fareInTime).toFixed(2));

  return {
    baseFare: rates.baseFare,
    fareInDistance,
    fareInTime,
    total,
  };
};
