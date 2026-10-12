const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../model/user-Model');
const Trip = require('../model/trip-model');
const MOCK_DATA = require('./mock-data');

dotenv.config({ path: './config.env' });
const db = process.env.DATABASE
  ? process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD || '')
  : null;

const importData = async () => {
  try {
    // Insert passengers using Mongoose to trigger pre-save hooks
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
      },
      driverProfile: undefined, // Explicitly exclude driverProfile for passengers
    }));

    await User.create(passengersToInsert, { validateBeforeSave: false });
    console.log(`✅ Inserted ${passengersToInsert.length} passengers`);

    // Insert drivers using Mongoose to trigger pre-save hooks
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
        // Map status values to match schema enum
        status:
          user.driverProfile.status === 'online'
            ? 'available'
            : user.driverProfile.status === 'on_trip'
              ? 'on_trip'
              : user.driverProfile.status === 'offline'
                ? 'offline'
                : 'available',
        // Add ride_type to active_vehicle
        active_vehicle: user.driverProfile.active_vehicle
          ? {
              ...user.driverProfile.active_vehicle,
              ride_type: 'standard', // Default to standard
            }
          : null,
      },
    }));

    await User.create(driversToInsert, { validateBeforeSave: false });
    console.log(`✅ Inserted ${driversToInsert.length} drivers`);

    // Get actual user IDs from database
    const driverUsers = await User.find({ role: 'driver' }).sort('createdAt');
    const passengerUsers = await User.find({ role: 'passenger' }).sort('createdAt');

    // Create mapping from mock IDs to real MongoDB IDs
    const driverIdMap = {};
    MOCK_DATA.drivers.forEach((driver, index) => {
      if (driverUsers[index]) {
        driverIdMap[driver.id] = driverUsers[index]._id;
      }
    });

    const passengerIdMap = {};
    MOCK_DATA.passengers.forEach((passenger, index) => {
      if (passengerUsers[index]) {
        passengerIdMap[passenger.id] = passengerUsers[index]._id;
      }
    });

    // Insert trips with real user IDs
    const tripsToInsert = MOCK_DATA.rides
      .map((ride) => {
        const driverId = driverIdMap[ride.driver_id];
        const passengerId = passengerIdMap[ride.passenger_id];

        if (!driverId || !passengerId) {
          console.log(`⚠️  Skipping ride ${ride.id} - missing user mapping`);
          return null;
        }

        // Get driver data for vehicle snapshot
        const driverData = MOCK_DATA.drivers.find((d) => d.id === ride.driver_id);

        return {
          driver_id: driverId,
          passenger_id: passengerId, // Note: using passenger_id (correct spelling)
          status: ride.status === 'in_progress' ? 'picked_up' : ride.status === 'completed' ? 'completed' : 'requested',
          vehicle_snapshot: {
            plate_number: driverData?.driverProfile?.active_vehicle?.plate_number || 'UNKNOWN',
            model: driverData?.driverProfile?.active_vehicle?.model || 'UNKNOWN',
            meter_serial_number: driverData?.driverProfile?.active_vehicle?.meter_serial_number || 'UNKNOWN',
          },
          pickup: {
            adress: ride.pickup_location.name,
            location: {
              type: 'Point',
              coordinates: ride.pickup_location.coordinates,
            },
            timeStamp: ride.pickup_time,
          },
          dropoff: {
            adress: ride.dropoff_location.name,
            location: {
              type: 'Point',
              coordinates: ride.dropoff_location.coordinates,
            },
            timeStamp: ride.dropoff_time,
          },
          metrics: {
            distance_km: ride.distance,
            duration_seconds: Math.floor((ride.dropoff_time - ride.pickup_time) / 1000),
          },
          payment: {
            payment_status: ride.status === 'completed' ? 'pain' : 'unpaid', // Note: schema has typo "pain" instead of "paid"
            payment_method: 'cash',
            fare_breakdown: {
              base_fare: 25,
              meter_fare: ride.fare - 25,
              total_fare: ride.fare,
            },
          },
        };
      })
      .filter((trip) => trip !== null);

    await Trip.create(tripsToInsert);
    console.log(`✅ Inserted ${tripsToInsert.length} trips`);

    console.log(
      `🎉 Data successfully loaded! Total: ${passengersToInsert.length + driversToInsert.length} users, ${tripsToInsert.length} trips`,
    );
  } catch (err) {
    console.log('❌ Import error:', err.message);
    console.log('Error details:', err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await User.deleteMany();
    await Trip.deleteMany();
    console.log('🗑️  Data deleted successfully');
  } catch (err) {
    console.log('❌ Delete error:', err.message);
  }
  process.exit();
};

const run = async () => {
  try {
    if (!db) {
      console.error('❌ DATABASE environment variable is not defined');
      process.exit(1);
    }

    await mongoose.connect(db);
    console.log('✅ DB connection successful!');

    if (process.argv[2] === '--import') {
      await importData();
    } else if (process.argv[2] === '--delete') {
      await deleteData();
    } else {
      console.log('❌ Please specify --import or --delete');
      process.exit(1);
    }
  } catch (err) {
    console.log('❌ Connection error:', err.message);
    process.exit(1);
  }
};

run();
