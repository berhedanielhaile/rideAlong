const mongoose = require('mongoose');
const { meterSnapshotSchema } = require('./metric-model');

const routeEstimateSchema = new mongoose.Schema(
  {
    distance_km: { type: Number, default: 0, min: 0 },
    duration_seconds: { type: Number, default: 0, min: 0 },
    estimated_distance_km: { type: Number, default: 0, min: 0 },
    estimated_duration_seconds: { type: Number, default: 0, min: 0 },
    actual_distance_km: { type: Number, min: 0 },
    actual_duration_seconds: { type: Number, min: 0 },
    route: {
      type: { type: String, enum: ['LineString'], default: 'LineString' },
      coordinates: { type: [[Number]], default: [] },
    },
  },
  { _id: false },
);

const TripSchema = new mongoose.Schema(
  {
    driver_id: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    passenger_id: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: false,
    },
    vehicle_snapshot: {
      plate_number: { type: String, required: true },
      model: { type: String, required: true },
      meter_serial_number: { type: String },
    },
    status: {
      type: String,
      enum: ['requested', 'accepted', 'arrived', 'picked_up', 'completed', 'cancelled'],
      default: 'requested',
    },
    pickup: {
      adress: { type: String },
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number] },
      },
      timeStamp: {
        type: Date,
        default: Date.now,
      },
    },
    dropoff: {
      adress: { type: String },
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number] },
      },
      timeStamp: Date,
    },
    metrics: routeEstimateSchema,
    meter: meterSnapshotSchema,
    payment: {
      payment_status: {
        type: String,
        enum: ['pain', 'unpaid', 'processing', 'failed', 'refunded'],
        default: 'unpaid',
      },
      payment_method: {
        type: String,
        enum: ['cash', 'card', 'mobile_money', 'wallet'],
        required: true,
      },
      transaction_reference: { type: String },
      fare_breakdown: {
        base_fare: { type: Number, required: true, default: 0 },
        meter_fare: { type: Number, required: true, default: 0 },
        surge_fare: { type: Number, default: 0 },
        tips: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        total_fare: { type: Number, required: true, default: 0 },
      },
      paid_at: { type: Date },
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
      min: [0, "Ratings can't be less than 0"],
    },
    ratingsAvg: {
      type: Number,
      default: 4.5,
      min: [1, "Ratings average can't be less than 1.0"],
      max: [5, "Ratings average can't be greater than 5.0"],
    },
  },
  { timestamps: true },
);
TripSchema.index({ passenger_id: 1, createdAt: -1 });
TripSchema.index({ driver_id: 1, status: 1, createdAt: -1 });

const Trip = mongoose.model('Trip', TripSchema);
module.exports = Trip;
