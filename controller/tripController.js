const axios = require('axios');
const Trip = require('../model/trip-model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const User = require('../model/user-Model');
const { findNearbyDrivers, envNumber, calcFare } = require('../utils/findDrivers');
const { calculateDistanceAndTime } = require('../utils/calcDistance');
const { buildRouteEstimate } = require('../utils/buildRouteEstimate');
const { Metric } = require('../model/metric-model');
const { getTripStatsForUser } = require('../utils/tripStats');

exports.getTripPreview = catchAsync(async (req, res, next) => {
  const pickupLat = Number(req.body.pickupLat);
  const pickupLon = Number(req.body.pickupLon);
  const dropoffLat = Number(req.body.dropoffLat);
  const dropoffLon = Number(req.body.dropoffLon);

  if (![pickupLat, pickupLon, dropoffLat, dropoffLon].every(Number.isFinite)) {
    return next(new AppError('pickupLat, pickupLon, dropoffLat and dropoffLon are required numbers', 400));
  }

  const [data, nearbyDrivers] = await Promise.all([
    calculateDistanceAndTime(pickupLat, pickupLon, dropoffLat, dropoffLon),
    findNearbyDrivers(pickupLon, pickupLat),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      totalDistance: Number(data.distanceInKm.toFixed(2)),
      totalDuration: data.durationFormatted,
      standardFares: calcFare(data.distanceInKm, data.durationMinutes, {
        baseFare: envNumber('BASE_FARE_STANDARD'),
        perKm: envNumber('FARE_PER_KILOMETER_STANDARD'),
        perMinute: envNumber('FARE_PER_MINUTE_STANDARD'),
      }),
      comfortFares: calcFare(data.distanceInKm, data.durationMinutes, {
        baseFare: envNumber('BASE_FARE_COMFORT'),
        perKm: envNumber('FARE_PER_KILOMETER_COMFORT'),
        perMinute: envNumber('FARE_PER_MINUTE_COMFORT'),
      }),
      premiumFares: calcFare(data.distanceInKm, data.durationMinutes, {
        baseFare: envNumber('BASE_FARE_PREMIUM'),
        perKm: envNumber('FARE_PER_KILOMETER_PREMIUM'),
        perMinute: envNumber('FARE_PER_MINUTE_PREMIUM'),
      }),
      geometry: data.geometry,
      nearbyDrivers: nearbyDrivers.map((driver) => ({
        _id: driver._id,
        name: driver.name,
        rating: driver.driverProfile?.rating,
        distanceMeters: driver.distanceMeters,
        location: driver.driverProfile?.current_location?.coordinates,
      })),
    },
  });
});

exports.getNearbyDriversPreview = catchAsync(async (req, res, next) => {
  const pickupLat = Number(req.body.pickupLat);
  const pickupLon = Number(req.body.pickupLon);
  if (![pickupLat, pickupLon].every(Number.isFinite)) {
    return next(new AppError('pickupLat and pickupLon are required numbers', 400));
  }

  const nearbyDrivers = await findNearbyDrivers(pickupLon, pickupLat);
  res.status(200).json({
    status: 'success',
    data: {
      nearbyDrivers: nearbyDrivers.map((driver) => ({
        _id: driver._id,
        name: driver.name,
        rating: driver.driverProfile?.rating,
        distanceMeters: driver.distanceMeters,
        location: driver.driverProfile?.current_location?.coordinates,
      })),
    },
  });
});

exports.createTrip = catchAsync(async (req, res, next) => {
  // 1) Extract and validate coordinates
  const pickupLat = Number(req.body.pickupLat);
  const pickupLon = Number(req.body.pickupLon);
  const dropoffLat = Number(req.body.dropoffLat);
  const dropoffLon = Number(req.body.dropoffLon);

  if (![pickupLat, pickupLon, dropoffLat, dropoffLon].every(Number.isFinite)) {
    return next(new AppError('pickupLat, pickupLon, dropoffLat and dropoffLon are required numbers', 400));
  }

  // 2) Validate coordinate ranges
  if (
    pickupLat < -90 ||
    pickupLat > 90 ||
    pickupLon < -180 ||
    pickupLon > 180 ||
    dropoffLat < -90 ||
    dropoffLat > 90 ||
    dropoffLon < -180 ||
    dropoffLon > 180
  ) {
    return next(
      new AppError('Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180', 400),
    );
  }
  const [nearbyDrivers, data] = await Promise.all([
    findNearbyDrivers(pickupLon, pickupLat),
    calculateDistanceAndTime(pickupLat, pickupLon, dropoffLat, dropoffLon),
  ]);

  // 3) Check if drivers are available
  if (!nearbyDrivers || nearbyDrivers.length === 0)
    return next(new AppError('there are no drivers available, please try again later!', 404));

  // 4) Assign the selected driver only if they are still nearby and available.
  if (typeof req.body.driverId !== 'string' || !req.body.driverId) {
    return next(new AppError('Please select an available driver.', 400));
  }
  const assignedDriver = nearbyDrivers.find((candidate) => candidate._id.toString() === req.body.driverId);
  if (!assignedDriver) {
    return next(new AppError('The selected driver is no longer available. Please choose another driver.', 409));
  }
  const driver = await User.findById(assignedDriver._id);
  if (!driver || driver.driverProfile?.status !== 'available') {
    return next(new AppError('The selected driver is no longer available. Please choose another driver.', 409));
  }

  // 5) Build trip data with metrics
  const tripData = {
    passenger_id: req.user.id,
    driver_id: driver._id,
    vehicle_snapshot: {
      plate_number: driver?.driverProfile.active_vehicle.plate_number,
      model: driver?.driverProfile.active_vehicle.model,
      meter_serial_number: driver?.driverProfile.active_vehicle.meter_serial_number,
    },
    pickup: {
      adress: req.body.pickupAddress || '',
      location: {
        type: 'Point',
        coordinates: [pickupLon, pickupLat],
      },
    },
    dropoff: {
      adress: req.body.dropoffAddress || '',
      location: {
        type: 'Point',
        coordinates: [dropoffLon, dropoffLat],
      },
    },
    metrics: buildRouteEstimate(data),
    payment: {
      payment_method: req.body.payment_method || 'cash',
      fare_breakdown: req.body.fare_breakdown || {
        base_fare: 0,
        meter_fare: 0,
        total_fare: 0,
      },
    },
  };

  const trip = await Trip.create(tripData);

  await User.findByIdAndUpdate(driver._id, {
    'driverProfile.status': 'on_trip',
  });

  res.status(200).json({
    status: 'success',
    data: {
      driver: {
        _id: driver._id,
        name: driver.name,
        rating: driver.driverProfile?.rating,
        vehicle: driver.driverProfile?.active_vehicle,
      },
      trip,
      distance: data.distanceInKm,
      duration: data.durationMinutes,
    },
  });
});
exports.getTrip = catchAsync(async (req, res, next) => {
  const trip = await Trip.findById(req.params.id).populate({
    path: 'driver_id',
    select: 'name driverProfile.rating driverProfile.active_vehicle driverProfile.current_location driverProfile.status',
  });
  if (!trip) return next(new AppError('Trip not found', 404));

  const driverId = trip.driver_id && trip.driver_id._id ? trip.driver_id._id.toString() : trip.driver_id.toString();
  const passengerId = trip.passenger_id && trip.passenger_id.toString();

  if (req.user.role !== 'admin' && req.user.id !== driverId && req.user.id !== passengerId) {
    return next(new AppError('You can only view trips you are involved in', 403));
  }

  res.status(200).json({
    status: 'success',
    data: trip,
  });
});

exports.recordMeterReading = catchAsync(async (req, res, next) => {
  const trip = await Trip.findById(req.params.id);
  if (!trip) return next(new AppError('Trip not found', 404));

  if (req.user.role !== 'admin' && req.user.id !== trip.driver_id.toString()) {
    return next(new AppError('Only the assigned driver can send meter readings for this trip', 403));
  }

  if (['completed', 'cancelled', 'requested'].includes(trip.status)) {
    return next(new AppError('Meter readings can only be sent while the trip is active', 400));
  }

  const fare = Number(req.body.fare);
  const distanceKm = Number(req.body.distance_km);
  if (![fare, distanceKm].every(Number.isFinite)) {
    return next(new AppError('fare and distance_km are required numbers from the car meter', 400));
  }

  const meterSerial =
    (typeof req.body.meter_serial_number === 'string' && req.body.meter_serial_number.trim()) ||
    trip.vehicle_snapshot.meter_serial_number;
  if (!meterSerial) {
    return next(new AppError('Meter serial number is required', 400));
  }
  if (
    trip.vehicle_snapshot.meter_serial_number &&
    meterSerial !== trip.vehicle_snapshot.meter_serial_number
  ) {
    return next(new AppError('Meter serial does not match the vehicle assigned to this trip', 409));
  }

  const recordedAt = req.body.recorded_at ? new Date(req.body.recorded_at) : new Date();
  if (Number.isNaN(recordedAt.getTime())) {
    return next(new AppError('recorded_at must be a valid date', 400));
  }

  const lng = Number(req.body.longitude);
  const lat = Number(req.body.latitude);
  const hasLocation = Number.isFinite(lng) && Number.isFinite(lat);
  const reading = {
    trip_id: trip._id,
    driver_id: trip.driver_id,
    meter_serial_number: meterSerial,
    fare,
    distance_km: distanceKm,
    waiting_seconds: Number.isFinite(Number(req.body.waiting_seconds)) ? Number(req.body.waiting_seconds) : 0,
    extras: Number.isFinite(Number(req.body.extras)) ? Number(req.body.extras) : 0,
    status: req.body.status || 'hired',
    recorded_at: recordedAt,
  };
  if (hasLocation) {
    reading.location = { type: 'Point', coordinates: [lng, lat] };
  }

  const metric = await Metric.create(reading);
  const isNewer = !trip.meter || !trip.meter.recorded_at || recordedAt >= new Date(trip.meter.recorded_at);
  if (isNewer) {
    trip.meter = {
      fare: metric.fare,
      distance_km: metric.distance_km,
      waiting_seconds: metric.waiting_seconds,
      extras: metric.extras,
      status: metric.status,
      meter_serial_number: metric.meter_serial_number,
      recorded_at: metric.recorded_at,
    };
    await trip.save();
  }

  if (hasLocation) {
    await User.findByIdAndUpdate(trip.driver_id, {
      'driverProfile.current_location': { type: 'Point', coordinates: [lng, lat] },
    });
  }

  res.status(201).json({
    status: 'success',
    data: {
      metric,
      meter: trip.meter,
    },
  });
});

exports.acceptTrip = catchAsync(async (req, res, next) => {
  const trip = await Trip.findById(req.params.id);
  if (!trip) return next(new AppError('Trip not found', 404));

  if (trip.status !== 'requested') {
    return next(new AppError('This trip is no longer available', 400));
  }

  // Driver can only accept trips assigned to them
  if (req.user.id !== trip.driver_id.toString()) {
    return next(new AppError('You can only accept trips assigned to you', 403));
  }

  trip.status = 'accepted';
  await trip.save();

  res.status(200).json({
    status: 'success',
    data: trip,
  });
});
exports.declineTrip = catchAsync(async (req, res, next) => {
  //1)find trip and getnear by drivers and calculate distance and time
  const trip = await Trip.findById(req.params.id);
  if (!trip) return next(new AppError('there is no trip for this id', 404));

  // Driver can only decline trips assigned to them
  if (req.user.id !== trip.driver_id.toString()) {
    return next(new AppError('You can only decline trips assigned to you', 403));
  }

  // Save original driver ID before updating
  const originalDriverId = trip.driver_id;

  // GeoJSON format is [longitude, latitude]
  const pickupLon = Number(trip.pickup.location.coordinates[0]);
  const pickupLat = Number(trip.pickup.location.coordinates[1]);
  const dropoffLon = Number(trip.dropoff.location.coordinates[0]);
  const dropoffLat = Number(trip.dropoff.location.coordinates[1]);

  const nearbyDrivers = await findNearbyDrivers(pickupLon, pickupLat);

  // Filter out the current driver who declined
  const availableDrivers = nearbyDrivers.filter((driver) => driver._id.toString() !== originalDriverId.toString());

  // Check if there are other available drivers
  if (!availableDrivers || availableDrivers.length === 0) {
    // No other drivers available, cancel the trip
    trip.status = 'cancelled';
    await trip.save();

    // Set original driver back to available
    await User.findByIdAndUpdate(originalDriverId, {
      'driverProfile.status': 'available',
    });

    return next(new AppError('No other drivers available, trip cancelled', 404));
  }

  const assignedDriver = availableDrivers[0];
  const driver = await User.findById(assignedDriver._id);

  // 5) Calculate distance and time
  const data = await calculateDistanceAndTime(pickupLat, pickupLon, dropoffLat, dropoffLon);
  //2) upadte trip with new driver and fares
  const updatedTrip = await Trip.findByIdAndUpdate(
    req.params.id,
    {
      driver_id: driver._id,
      vehicle_snapshot: {
        plate_number: driver?.driverProfile.active_vehicle.plate_number,
        model: driver?.driverProfile.active_vehicle.model,
        meter_serial_number: driver?.driverProfile.active_vehicle.meter_serial_number,
      },

      metrics: buildRouteEstimate(data),
      payment: {
        payment_method: req.body.payment_method || 'cash',
        fare_breakdown: req.body.fare_breakdown || {
          base_fare: 0,
          meter_fare: 0,
          total_fare: 0,
        },
      },
    },
    { new: true, runValidators: true },
  );

  // Set original driver back to available
  await User.findByIdAndUpdate(originalDriverId, {
    'driverProfile.status': 'available',
  });

  await User.findByIdAndUpdate(driver._id, {
    'driverProfile.status': 'on_trip',
  });

  //3) send updated response,
  res.status(200).json({
    status: 'success',
    trip: updatedTrip,
  });
});
exports.updateTripStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ['arrived', 'picked_up', 'completed', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid status', 400));
  }

  const trip = await Trip.findById(req.params.id);
  if (!trip) return next(new AppError('Trip not found', 404));

  // Only driver, passenger, or admin can update trip status
  if (
    req.user.role !== 'admin' &&
    req.user.id !== trip.driver_id.toString() &&
    req.user.id !== trip.passenger_id.toString()
  ) {
    return next(new AppError('You can only update status for trips you are involved in', 403));
  }

  trip.status = status;
  if (status === 'picked_up') {
    trip.pickup.timeStamp = new Date();
  }
  if (status === 'completed') {
    trip.dropoff.timeStamp = new Date();
    if (!trip.metrics) trip.metrics = {};
    if (trip.pickup && trip.pickup.timeStamp) {
      const actualSeconds = Math.max(0, Math.round((Date.now() - new Date(trip.pickup.timeStamp).getTime()) / 1000));
      trip.metrics.actual_duration_seconds = actualSeconds;
      trip.metrics.duration_seconds = actualSeconds;
    }
    if (trip.meter && trip.meter.distance_km != null) {
      trip.metrics.actual_distance_km = trip.meter.distance_km;
      trip.metrics.distance_km = trip.meter.distance_km;
    } else if (trip.metrics.distance_km && !trip.metrics.actual_distance_km) {
      trip.metrics.actual_distance_km = trip.metrics.distance_km;
    }
    if (trip.meter && trip.meter.fare != null) {
      trip.payment.fare_breakdown.meter_fare = trip.meter.fare;
      const extras = trip.meter.extras || 0;
      const tips = trip.payment.fare_breakdown.tips || 0;
      const tax = trip.payment.fare_breakdown.tax || 0;
      trip.payment.fare_breakdown.total_fare = Number((trip.meter.fare + extras + tips + tax).toFixed(2));
    }
    if (trip.payment.payment_method === 'wallet' && trip.passenger_id) {
      const fare = trip.payment.fare_breakdown.total_fare || 0;
      await User.findByIdAndUpdate(trip.passenger_id, {
        $inc: { 'passengerProfile.wallet_balance': -fare },
        $push: {
          'passengerProfile.wallet_history': {
            type: 'ride',
            amount: -fare,
            note: `${(trip.pickup && trip.pickup.adress) || 'Pickup'} to ${
              (trip.dropoff && trip.dropoff.adress) || 'Drop-off'
            }`,
            createdAt: new Date(),
          },
        },
      });
    }
    await User.findByIdAndUpdate(trip.driver_id, { $inc: { 'driverProfile.total_trips': 1 } });
  }
  if (req.body.rating) {
    trip.ratingsQuantity = req.body.rating;
  }
  if (status === 'completed' || status === 'cancelled') {
    await User.findByIdAndUpdate(trip.driver_id, {
      'driverProfile.status': 'available',
    });
  }

  await trip.save();

  res.status(200).json({
    status: 'success',
    data: trip,
  });
});
exports.getDriverRequests = catchAsync(async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    return next(new AppError('You can only view your own ride requests', 403));
  }
  const driverId = req.params.id;
  const requests = await Trip.find({
    driver_id: driverId,
    status: 'requested',
  }).sort('-createdAt');

  res.status(200).json({
    status: 'success',
    data: { count: requests.length, requests },
  });
});

exports.getAllTrips = catchAsync(async (req, res, next) => {
  // Users can only view their own trips (unless admin)
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    return next(new AppError('You can only view your own trips', 403));
  }

  const userId = req.params.id;
  const trips = await Trip.find({
    $or: [{ driver_id: userId }, { passenger_id: userId }],
  }).sort('-createdAt');

  res.status(200).json({
    status: 'success',
    data: { count: trips.length, trips },
  });
});
exports.getUserTripStats = catchAsync(async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    return next(new AppError('You can only view your own trip stats', 403));
  }

  const stats = await getTripStatsForUser(req.params.id);
  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});
