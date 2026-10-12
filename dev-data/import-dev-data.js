const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../model/user-Model');
const Trip = require('../model/trip-model');
const { Metric } = require('../model/metric-model');
const MOCK_DATA = require('./mock-data');

dotenv.config({ path: './config.env' });
const db = process.env.DATABASE
  ? process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD || '')
  : null;

const seedEmails = [...MOCK_DATA.passengers, ...MOCK_DATA.drivers].map((user) => user.email.toLowerCase());

const mapStatus = (status) => {
  if (status === 'in_progress') return 'picked_up';
  if (['requested', 'accepted', 'arrived', 'picked_up', 'completed', 'cancelled'].includes(status)) return status;
  return 'requested';
};

const mapPaymentMethod = (method) => {
  if (method === 'visa' || method === 'card') return 'card';
  if (method === 'telebirr' || method === 'cbe_bank' || method === 'mobile_money') return 'mobile_money';
  if (method === 'wallet') return 'wallet';
  return 'cash';
};

const mapDriverStatus = (status) => {
  if (status === 'online') return 'available';
  if (['available', 'offline', 'on_trip', 'break'].includes(status)) return status;
  return 'available';
};

const seedUsers = async () => {
  const existing = await User.find({ email: { $in: seedEmails } }).select('+active');
  const existingIds = existing.map((user) => user._id);
  if (existingIds.length) {
    await Trip.deleteMany({
      $or: [{ passenger_id: { $in: existingIds } }, { driver_id: { $in: existingIds } }],
    });
    await Metric.deleteMany({ driver_id: { $in: existingIds } });
    await User.deleteMany({ email: { $in: seedEmails } });
  }

  const passengersToInsert = MOCK_DATA.passengers.map((user) => ({
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    password: 'password123',
    passwordConfirm: 'password123',
    createdAt: user.createdAt,
    passengerProfile: {
      default_payment_method: user.passengerProfile.default_payment_method,
      saved_Places: user.passengerProfile.saved_Places || [],
      wallet_balance: user.passengerProfile.wallet_balance || 0,
      wallet_history: user.passengerProfile.wallet_history || [],
    },
  }));

  const driversToInsert = MOCK_DATA.drivers.map((user) => ({
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    password: 'password123',
    passwordConfirm: 'password123',
    createdAt: user.createdAt,
    driverProfile: {
      ...user.driverProfile,
      status: mapDriverStatus(user.driverProfile.status),
      active_vehicle: user.driverProfile.active_vehicle
        ? {
            ...user.driverProfile.active_vehicle,
            ride_type: user.driverProfile.active_vehicle.ride_type || 'standard',
          }
        : null,
    },
  }));

  await User.create([...passengersToInsert, ...driversToInsert], { validateBeforeSave: false });
  console.log(`Inserted ${passengersToInsert.length} passengers and ${driversToInsert.length} drivers`);
  return User.find({ email: { $in: seedEmails } });
};

const importData = async () => {
  try {
    const savedUsers = await seedUsers();
    const byEmail = Object.fromEntries(savedUsers.map((user) => [user.email.toLowerCase(), user]));
    const driverIdMap = {};
    const passengerIdMap = {};

    MOCK_DATA.drivers.forEach((driver) => {
      const saved = byEmail[driver.email.toLowerCase()];
      if (saved) driverIdMap[driver.id] = saved._id;
    });
    MOCK_DATA.passengers.forEach((passenger) => {
      const saved = byEmail[passenger.email.toLowerCase()];
      if (saved) passengerIdMap[passenger.id] = saved._id;
    });

    const tripsToInsert = MOCK_DATA.rides
      .map((ride) => {
        const driverId = driverIdMap[ride.driver_id];
        const passengerId = passengerIdMap[ride.passenger_id];
        if (!driverId || !passengerId) {
          console.log(`Skipping ride ${ride.id} - missing user mapping`);
          return null;
        }

        const driverData = MOCK_DATA.drivers.find((driver) => driver.id === ride.driver_id);
        const status = mapStatus(ride.status);
        const durationSeconds = Math.max(60, Math.floor((ride.dropoff_time - ride.pickup_time) / 1000) || 600);

        return {
          driver_id: driverId,
          passenger_id: passengerId,
          status,
          vehicle_snapshot: {
            plate_number: driverData?.driverProfile?.active_vehicle?.plate_number || 'UNKNOWN',
            model: driverData?.driverProfile?.active_vehicle?.model || 'UNKNOWN',
            meter_serial_number: driverData?.driverProfile?.active_vehicle?.meter_serial_number || 'UNKNOWN',
          },
          pickup: {
            adress: ride.pickup_location.name,
            location: { type: 'Point', coordinates: ride.pickup_location.coordinates },
            timeStamp: ride.pickup_time,
          },
          dropoff: {
            adress: ride.dropoff_location.name,
            location: { type: 'Point', coordinates: ride.dropoff_location.coordinates },
            timeStamp: status === 'completed' ? ride.dropoff_time : undefined,
          },
          metrics: {
            distance_km: ride.distance,
            duration_seconds: durationSeconds,
            estimated_distance_km: ride.distance,
            estimated_duration_seconds: durationSeconds,
            route: {
              type: 'LineString',
              coordinates: [ride.pickup_location.coordinates, ride.dropoff_location.coordinates],
            },
          },
          meter: ride.meter
            ? {
                ...ride.meter,
                meter_serial_number:
                  ride.meter.meter_serial_number === 'METER-LIVE'
                    ? driverData?.driverProfile?.active_vehicle?.meter_serial_number
                    : ride.meter.meter_serial_number,
              }
            : undefined,
          payment: {
            payment_status: status === 'completed' ? 'pain' : 'unpaid',
            payment_method: mapPaymentMethod(ride.payment_method),
            fare_breakdown: {
              base_fare: 25,
              meter_fare: Math.max(0, (ride.fare || 0) - 25),
              total_fare: ride.fare || 0,
            },
            paid_at: status === 'completed' ? ride.dropoff_time : undefined,
          },
          ratingsAvg: ride.rating || 4.5,
          ratingsQuantity: ride.rating ? 1 : 0,
          createdAt: ride.pickup_time,
        };
      })
      .filter(Boolean);

    const trips = await Trip.create(tripsToInsert);
    console.log(`Inserted ${trips.length} trips`);

    const meterTrips = trips.filter((trip) => trip.meter && trip.meter.fare != null);
    if (meterTrips.length) {
      await Metric.insertMany(
        meterTrips.map((trip) => ({
          trip_id: trip._id,
          driver_id: trip.driver_id,
          meter_serial_number: trip.meter.meter_serial_number || trip.vehicle_snapshot.meter_serial_number,
          fare: trip.meter.fare,
          distance_km: trip.meter.distance_km,
          waiting_seconds: trip.meter.waiting_seconds,
          extras: trip.meter.extras,
          status: trip.meter.status,
          recorded_at: trip.meter.recorded_at,
          location: trip.pickup.location,
        })),
      );
      console.log(`Inserted ${meterTrips.length} meter readings`);
    }

    console.log(
      `Data loaded. Seed accounts use password123. Try sarah.johnson@email.com (rider) or addis.alemayehu@email.com (driver).`,
    );
  } catch (err) {
    console.log('Import error:', err.message);
    console.log('Error details:', err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    const existing = await User.find({ email: { $in: seedEmails } }).select('+active');
    const existingIds = existing.map((user) => user._id);
    await Trip.deleteMany({
      $or: [{ passenger_id: { $in: existingIds } }, { driver_id: { $in: existingIds } }],
    });
    await Metric.deleteMany({ driver_id: { $in: existingIds } });
    await User.deleteMany({ email: { $in: seedEmails } });
    console.log(`Removed ${existing.length} seed users and their trips`);
  } catch (err) {
    console.log('Delete error:', err.message);
  }
  process.exit();
};

const run = async () => {
  try {
    if (!db) {
      console.error('DATABASE environment variable is not defined');
      process.exit(1);
    }

    await mongoose.connect(db);
    console.log('DB connection successful');

    if (process.argv[2] === '--import') {
      await importData();
    } else if (process.argv[2] === '--delete') {
      await deleteData();
    } else {
      console.log('Please specify --import or --delete');
      process.exit(1);
    }
  } catch (err) {
    console.log('Connection error:', err.message);
    process.exit(1);
  }
};

run();
