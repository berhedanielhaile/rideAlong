const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const Trip = require('../model/trip-model');
const AppError = require('../utils/AppError');
const { getTripStatsForUser } = require('../utils/tripStats');
const {
  formatMoney,
  formatTripWhen,
  initialsFor,
  greetingForHour,
  ratingHint,
  tripTitle,
} = require('../utils/viewFormat');

const DRIVER_STATUS_COPY = {
  accepted: 'Head to pickup',
  arrived: 'Waiting at pickup',
  picked_up: 'Trip in progress',
};

const tripPlaces = (trip) => ({
  pickup: (trip.pickup && trip.pickup.adress) || 'Pickup',
  dropoff: (trip.dropoff && trip.dropoff.adress) || 'Drop-off',
  eta: `${Math.max(1, Math.round(((trip.metrics && trip.metrics.duration_seconds) || 0) / 60))} min`,
  distance: `${Number((trip.metrics && trip.metrics.distance_km) || 0).toFixed(1)} km`,
});

const COMMISSION_RATE = 0.15;

const requireUser = (req, res) => {
  const user = req.user || res.locals.user;
  if (!user) {
    res.redirect('/login');
    return null;
  }
  return user;
};

const mapRideCard = (trip, counterpart) => ({
  id: String(trip._id),
  title: tripTitle(trip),
  when: formatTripWhen(trip.createdAt),
  createdAt: trip.createdAt,
  fare: formatMoney(trip.payment && trip.payment.fare_breakdown && trip.payment.fare_breakdown.total_fare),
  fareValue: (trip.payment && trip.payment.fare_breakdown && trip.payment.fare_breakdown.total_fare) || 0,
  rating: trip.ratingsAvg != null ? Number(trip.ratingsAvg).toFixed(1) : '—',
  status: trip.status,
  counterpart: counterpart || '—',
  distance: `${Number((trip.metrics && trip.metrics.distance_km) || 0).toFixed(1)} km`,
  searchText: `${tripTitle(trip)} ${counterpart || ''}`.toLowerCase(),
});

exports.getHomepage = catchAsync(async (req, res, next) => {
  res.status(200).render('index', {
    title: 'Reliable rides in Addis Ababa',
  });
});

exports.showDashboard = catchAsync(async (req, res, next) => {
  const user = requireUser(req, res);
  if (!user) return;
  if (user.role === 'driver') return res.redirect('/driver');

  const tripFilter = { passenger_id: user._id };
  const [tripStats, recentTrips] = await Promise.all([
    getTripStatsForUser(user._id),
    Trip.find(tripFilter).sort({ createdAt: -1 }).limit(4).lean(),
  ]);

  const rating = tripStats.avgRating;
  const saved = (user.passengerProfile && user.passengerProfile.savedOffers) || 0;
  const walletBalance = (user.passengerProfile && user.passengerProfile.wallet_balance) || 0;

  res.status(200).render('dashboard', {
    title: 'Dashboard',
    greeting: greetingForHour(new Date().getHours()),
    firstName: (user.name || 'there').split(' ')[0],
    stats: {
      totalRides: tripStats.totalRides,
      ridesThisMonth: tripStats.ridesThisMonth,
      saved: formatMoney(saved),
      rating: rating != null ? Number(rating).toFixed(1) : '—',
      ratingHint: ratingHint(rating),
      completedRides: tripStats.completedRides,
      totalDistanceKm: Number(tripStats.totalDistanceKm || 0).toFixed(1),
    },
    recentRides: recentTrips.map((trip) => mapRideCard(trip)),
    walletBalance: formatMoney(walletBalance),
  });
});

exports.showBookings = catchAsync(async (req, res, next) => {
  const user = requireUser(req, res);
  if (!user) return;
  res.status(200).render('booking', {
    title: 'Book your ride',
  });
});

exports.showTracking = catchAsync(async (req, res, next) => {
  const user = requireUser(req, res);
  if (!user) return;
  if (!mongoose.Types.ObjectId.isValid(req.params.trip)) {
    return next(new AppError('Trip not found', 404));
  }

  const trip = await Trip.findById(req.params.trip)
    .populate({
      path: 'driver_id',
      select: 'name driverProfile.rating driverProfile.active_vehicle driverProfile.current_location driverProfile.status',
    })
    .lean();
  if (!trip) return next(new AppError('Trip not found', 404));
  if (
    user.role !== 'admin' &&
    user._id.toString() !== trip.passenger_id?.toString() &&
    user._id.toString() !== trip.driver_id?._id.toString()
  ) {
    return next(new AppError('You can only view trips you are involved in', 403));
  }

  const driver = trip.driver_id || { name: 'Driver details unavailable', driverProfile: { rating: null } };
  const metrics = trip.metrics || {};
  const meter = trip.meter || null;
  const fare = (trip.payment && trip.payment.fare_breakdown) || {};
  const liveMeter = Boolean(meter && meter.recorded_at);
  const pickupCoords = (trip.pickup && trip.pickup.location && trip.pickup.location.coordinates) || [];
  const dropoffCoords = (trip.dropoff && trip.dropoff.location && trip.dropoff.location.coordinates) || [];
  res.status(200).render('tracking', {
    title: 'Track your ride',
    trip,
    driver,
    distanceCaption: liveMeter ? 'Meter distance' : 'Estimated distance',
    distanceLabel: `${Number((liveMeter ? meter.distance_km : metrics.distance_km) || 0).toFixed(2)} km`,
    durationLabel: `${Math.round((metrics.duration_seconds || 0) / 60)} min`,
    waitingLabel: `${Math.round(((meter && meter.waiting_seconds) || 0) / 60)} min`,
    fareCaption: liveMeter ? 'Meter fare' : 'Estimated fare',
    fareLabel: formatMoney(liveMeter ? meter.fare : fare.total_fare),
    tripBoot: JSON.stringify({
      id: String(trip._id),
      status: trip.status,
      pickup: {
        label: (trip.pickup && trip.pickup.adress) || 'Pickup',
        coordinates: pickupCoords,
        timeStamp: trip.pickup && trip.pickup.timeStamp,
      },
      dropoff: {
        label: (trip.dropoff && trip.dropoff.adress) || 'Drop-off',
        coordinates: dropoffCoords,
      },
      metrics,
      meter,
      fare,
      driver: {
        name: driver.name,
        rating: driver.driverProfile && driver.driverProfile.rating,
        vehicle: trip.vehicle_snapshot,
        location:
          driver.driverProfile &&
          driver.driverProfile.current_location &&
          driver.driverProfile.current_location.coordinates,
      },
      createdAt: trip.createdAt,
    }).replace(/</g, '\\u003c'),
  });
});

exports.showHistory = catchAsync(async (req, res, next) => {
  const user = requireUser(req, res);
  if (!user) return;

  const filter = user.role === 'driver' ? { driver_id: user._id } : { passenger_id: user._id };
  const populatePath = user.role === 'driver' ? 'passenger_id' : 'driver_id';
  const [tripStats, trips] = await Promise.all([
    getTripStatsForUser(user._id),
    Trip.find(filter).populate({ path: populatePath, select: 'name' }).sort({ createdAt: -1 }).limit(50).lean(),
  ]);

  res.status(200).render('history', {
    title: 'Ride history',
    stats: {
      totalRides: tripStats.totalRides,
      totalDistanceKm: Number(tripStats.totalDistanceKm || 0).toFixed(0),
      spent: formatMoney(tripStats.totalFare),
      rating: tripStats.avgRating != null ? Number(tripStats.avgRating).toFixed(1) : '—',
    },
    rides: trips.map((trip) => {
      const other = trip[populatePath];
      return mapRideCard(trip, other && other.name);
    }),
  });
});

exports.showWallet = catchAsync(async (req, res, next) => {
  const user = requireUser(req, res);
  if (!user) return;

  const history = [...((user.passengerProfile && user.passengerProfile.wallet_history) || [])].reverse();
  const activity = history.slice(0, 12).map((item) => ({
    title: item.type === 'topup' ? 'Wallet top-up' : item.type === 'bonus' ? 'Bonus' : 'Ride payment',
    note: item.note || '',
    amount: item.amount,
    amountLabel: `${item.amount >= 0 ? '+ ' : '- '}${formatMoney(Math.abs(item.amount))}`,
    positive: item.amount >= 0,
    when: formatTripWhen(item.createdAt),
  }));

  res.status(200).render('wallet', {
    title: 'Wallet',
    walletBalance: formatMoney((user.passengerProfile && user.passengerProfile.wallet_balance) || 0),
    activity,
  });
});

exports.showProfile = catchAsync(async (req, res, next) => {
  const user = requireUser(req, res);
  if (!user) return;
  const profile = user.passengerProfile || {};
  const driver = user.driverProfile || {};
  const vehicle = driver.active_vehicle || {};
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '';

  res.status(200).render('profile', {
    title: 'Profile',
    initials: initialsFor(user.name),
    memberSince,
    defaultPayment: profile.default_payment_method || 'cash',
    savedPlaces: profile.saved_Places || [],
    driverStatus: driver.status || 'offline',
    driverRating: driver.rating != null ? Number(driver.rating).toFixed(1) : '—',
    driverTrips: driver.total_trips || 0,
    license: driver.license_number || '',
    vehicle,
  });
});

exports.showDriverDashboard = catchAsync(async (req, res, next) => {
  const user = requireUser(req, res);
  if (!user) return;
  if (user.role !== 'driver') return res.redirect('/dashboard');

  const [tripStats, activeTrip, requests] = await Promise.all([
    getTripStatsForUser(user._id),
    Trip.findOne({
      driver_id: user._id,
      status: { $in: ['accepted', 'arrived', 'picked_up'] },
    })
      .populate({ path: 'passenger_id', select: 'name' })
      .lean(),
    Trip.find({ driver_id: user._id, status: 'requested' })
      .populate({ path: 'passenger_id', select: 'name' })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  const vehicle = (user.driverProfile && user.driverProfile.active_vehicle) || {};
  const online = user.driverProfile && user.driverProfile.status === 'available';
  const onTrip = user.driverProfile && user.driverProfile.status === 'on_trip';

  res.status(200).render('driverDashboard', {
    title: 'Driver home',
    greeting: greetingForHour(new Date().getHours()),
    firstName: (user.name || 'there').split(' ')[0],
    userId: String(user._id),
    online,
    onTrip,
    statusLabel: onTrip ? 'On a trip' : online ? 'Online and available' : 'Offline',
    stats: {
      ridesToday: tripStats.ridesToday,
      earningsToday: formatMoney(tripStats.fareToday),
      rating: user.driverProfile && user.driverProfile.rating != null ? Number(user.driverProfile.rating).toFixed(1) : '—',
      ratingHint: ratingHint(user.driverProfile && user.driverProfile.rating),
      totalTrips: tripStats.totalRides,
      weekEarnings: formatMoney(tripStats.fareThisWeek),
    },
    activeTrip: activeTrip
      ? {
          id: String(activeTrip._id),
          title: tripTitle(activeTrip),
          passenger: (activeTrip.passenger_id && activeTrip.passenger_id.name) || 'Passenger',
          passengerInitials: initialsFor((activeTrip.passenger_id && activeTrip.passenger_id.name) || 'Passenger'),
          fare: formatMoney(
            activeTrip.payment && activeTrip.payment.fare_breakdown && activeTrip.payment.fare_breakdown.total_fare,
          ),
          status: activeTrip.status,
          statusLabel: DRIVER_STATUS_COPY[activeTrip.status] || activeTrip.status,
          when: formatTripWhen(activeTrip.createdAt),
          ...tripPlaces(activeTrip),
        }
      : null,
    requests: requests.map((trip) => ({
      id: String(trip._id),
      title: tripTitle(trip),
      passenger: (trip.passenger_id && trip.passenger_id.name) || 'Passenger',
      passengerInitials: initialsFor((trip.passenger_id && trip.passenger_id.name) || 'Passenger'),
      fare: formatMoney(trip.payment && trip.payment.fare_breakdown && trip.payment.fare_breakdown.total_fare),
      when: formatTripWhen(trip.createdAt),
      ...tripPlaces(trip),
    })),
    vehicle,
  });
});

exports.showEarnings = catchAsync(async (req, res, next) => {
  const user = requireUser(req, res);
  if (!user) return;
  if (user.role !== 'driver') return res.redirect('/history');

  const [tripStats, trips] = await Promise.all([
    getTripStatsForUser(user._id),
    Trip.find({ driver_id: user._id, status: 'completed' })
      .populate({ path: 'passenger_id', select: 'name' })
      .sort({ createdAt: -1 })
      .limit(40)
      .lean(),
  ]);

  const rows = trips.map((trip) => {
    const fare = (trip.payment && trip.payment.fare_breakdown && trip.payment.fare_breakdown.total_fare) || 0;
    const commission = fare * COMMISSION_RATE;
    const net = fare - commission;
    const passenger = (trip.passenger_id && trip.passenger_id.name) || 'Passenger';
    return {
      title: tripTitle(trip),
      passenger,
      distance: `${Number((trip.metrics && trip.metrics.distance_km) || 0).toFixed(1)} km`,
      fare: formatMoney(fare),
      commission: formatMoney(commission),
      earnings: formatMoney(net),
      when: formatTripWhen(trip.createdAt),
      createdAt: trip.createdAt,
      searchText: `${tripTitle(trip)} ${passenger}`.toLowerCase(),
    };
  });

  res.status(200).render('earnings', {
    title: 'Earnings',
    stats: {
      week: formatMoney(tripStats.fareThisWeek * (1 - COMMISSION_RATE)),
      month: formatMoney(tripStats.fareThisMonth * (1 - COMMISSION_RATE)),
      lifetime: formatMoney(tripStats.totalFare * (1 - COMMISSION_RATE)),
      trips: tripStats.completedRides,
      rides: tripStats.totalRides,
      distance: Number(tripStats.totalDistanceKm || 0).toFixed(0),
      rating: user.driverProfile && user.driverProfile.rating != null ? Number(user.driverProfile.rating).toFixed(1) : '—',
    },
    rows,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  res.status(200).render('authTab', {
    title: 'Sign in',
    authTab: 'login',
    bodyClass: 'auth-body',
  });
});

exports.signup = catchAsync(async (req, res, next) => {
  res.status(200).render('authTab', {
    title: 'Create account',
    authTab: 'register',
    bodyClass: 'auth-body',
  });
});
