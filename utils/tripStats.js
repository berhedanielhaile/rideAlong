const mongoose = require('mongoose');
const Trip = require('../model/trip-model');
const { startOfDay, startOfWeek, startOfMonth } = require('./viewFormat');

exports.getTripStatsForUser = async (userId) => {
  const id = new mongoose.Types.ObjectId(String(userId));
  const day = startOfDay();
  const week = startOfWeek();
  const month = startOfMonth();
  const [doc] = await Trip.aggregate([
    {
      $match: {
        $or: [{ driver_id: id }, { passenger_id: id }],
      },
    },
    {
      $group: {
        _id: null,
        totalRides: { $sum: 1 },
        completedRides: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
        },
        ridesToday: {
          $sum: { $cond: [{ $gte: ['$createdAt', day] }, 1, 0] },
        },
        ridesThisWeek: {
          $sum: { $cond: [{ $gte: ['$createdAt', week] }, 1, 0] },
        },
        ridesThisMonth: {
          $sum: { $cond: [{ $gte: ['$createdAt', month] }, 1, 0] },
        },
        avgRating: { $avg: '$ratingsAvg' },
        avgFare: { $avg: '$payment.fare_breakdown.total_fare' },
        totalFare: { $sum: '$payment.fare_breakdown.total_fare' },
        fareToday: {
          $sum: { $cond: [{ $gte: ['$createdAt', day] }, '$payment.fare_breakdown.total_fare', 0] },
        },
        fareThisWeek: {
          $sum: { $cond: [{ $gte: ['$createdAt', week] }, '$payment.fare_breakdown.total_fare', 0] },
        },
        fareThisMonth: {
          $sum: { $cond: [{ $gte: ['$createdAt', month] }, '$payment.fare_breakdown.total_fare', 0] },
        },
        totalDistanceKm: { $sum: '$metrics.distance_km' },
        totalDurationSeconds: { $sum: '$metrics.duration_seconds' },
        minFare: { $min: '$payment.fare_breakdown.total_fare' },
        maxFare: { $max: '$payment.fare_breakdown.total_fare' },
      },
    },
  ]);

  return (
    doc || {
      totalRides: 0,
      completedRides: 0,
      ridesToday: 0,
      ridesThisWeek: 0,
      ridesThisMonth: 0,
      avgRating: null,
      avgFare: 0,
      totalFare: 0,
      fareToday: 0,
      fareThisWeek: 0,
      fareThisMonth: 0,
      totalDistanceKm: 0,
      totalDurationSeconds: 0,
      minFare: 0,
      maxFare: 0,
    }
  );
};
