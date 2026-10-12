const mongoose = require('mongoose');

// Latest reading copied onto the trip so tracking can poll one document.
const meterSnapshotSchema = new mongoose.Schema(
  {
    fare: { type: Number, default: 0, min: 0 },
    distance_km: { type: Number, default: 0, min: 0 },
    waiting_seconds: { type: Number, default: 0, min: 0 },
    extras: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['vacant', 'hired', 'stopped', 'payment'],
      default: 'hired',
    },
    meter_serial_number: { type: String, trim: true },
    recorded_at: { type: Date, default: Date.now },
    location: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number] },
    },
  },
  { _id: false },
);

// One document per ping from the in-car meter software.
const metricSchema = new mongoose.Schema(
  {
    trip_id: {
      type: mongoose.Schema.ObjectId,
      ref: 'Trip',
      required: true,
    },
    driver_id: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    meter_serial_number: {
      type: String,
      required: [true, 'Meter serial number is required'],
      trim: true,
    },
    fare: { type: Number, required: true, min: 0 },
    distance_km: { type: Number, required: true, min: 0 },
    waiting_seconds: { type: Number, default: 0, min: 0 },
    extras: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['vacant', 'hired', 'stopped', 'payment'],
      default: 'hired',
    },
    recorded_at: { type: Date, default: Date.now },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] },
    },
  },
  { timestamps: true },
);

metricSchema.index({ trip_id: 1, recorded_at: -1 });
metricSchema.index({ driver_id: 1, recorded_at: -1 });
metricSchema.index({ meter_serial_number: 1, recorded_at: -1 });

const Metric = mongoose.model('Metric', metricSchema);

module.exports = { Metric, meterSnapshotSchema };
