const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const vehicleSchema = new mongoose.Schema(
  {
    ride_type: {
      type: String,
      enum: ['standard', 'comfort', 'premium'],
      default: 'standard',
    },
    plate_number: { type: String, required: true },
    model: { type: String, required: true },
    color: { type: String, required: true },
    year: { type: Number, required: true },
    meter_serial_number: { type: String, required: true },
  },
  { _id: false },
);
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User must have a name'],
      trim: true,
      maxlength: [30, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'User must have an email'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (email) {
          return /^\S+@\S+\.\S+$/.test(email);
        },
        message: 'Please provide a valid email address',
      },
    },
    phoneNumber: {
      type: String,
      trim: true,
      required: [true, 'User must have a phone number'],
      unique: true,
      sparse: true,
      validate: {
        validator: function (phone) {
          if (!phone) return true; // Allow empty phone numbers
          // Accept both formats: +251XXXXXXXXX or 251XXXXXXXXX or just 9 digits
          const cleanPhone = phone.replace(/\D/g, ''); // Remove non-digits
          if (cleanPhone.length === 9) return true; // Just 9 digits
          if (cleanPhone.length === 12 && cleanPhone.startsWith('251')) return true; // 251XXXXXXXXX
          if (cleanPhone.length === 13 && cleanPhone.startsWith('251')) return true; // +251XXXXXXXXX
          return false;
        },
        message: 'Phone number must be in format +251XXXXXXXXX or 251XXXXXXXXX or 9 digits',
      },
    },
    role: {
      type: String,
      enum: ['admin', 'passenger', 'driver'],
      default: 'passenger',
    },
    photo: {
      type: String,
      default: 'deafualt.jpg',
    },
    password: {
      type: String,
      required: [true, 'User must have a password'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords are not the same',
      },
    },
    passengerProfile: {
      default_payment_method: {
        type: String,
      },
      savedOffers: { type: Number, default: 0 },
      wallet_balance: { type: Number, default: 0 },
      wallet_history: [
        {
          type: { type: String, enum: ['topup', 'ride', 'bonus'], required: true },
          amount: { type: Number, required: true },
          note: { type: String, default: '' },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      saved_Places: [
        {
          name: String,
          adress: { type: String },
          coordinates: {
            type: [Number],
            index: '2dsphere',
          },
        },
      ],
    },
    driverProfile: {
      license_number: {
        type: String,
        sparse: true,
        unique: true,
      },
      status: {
        type: String,
        enum: ['offline', 'on_trip', 'available', 'break'],
        default: 'offline',
      },
      rating: { type: Number, default: 5.0 },
      total_trips: { type: Number, default: 0 },

      current_location: {
        type: { type: String, enum: ['Point'] },
        coordinates: { type: [Number] },
      },
      active_vehicle: { type: vehicleSchema, default: null },
    },
    passwordChangedAt: Date,
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    loginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, select: false },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  { timestamps: true },
);

// Required for $near / $geoNear on driver location. GeoJSON is [lng, lat].
userSchema.index({ 'driverProfile.current_location': '2dsphere' });

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);
  this.passwordConfirm = undefined;
  this.passwordChangedAt = new Date(Date.now());
  next();
});
userSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() || {};
  const password = update.password || (update.$set && update.$set.password);
  if (!password) return next();

  const hashed = await bcrypt.hash(password, 10);
  if (update.password) update.password = hashed;
  if (update.$set && update.$set.password) update.$set.password = hashed;
  if (!update.$set) update.$set = {};
  update.$set.passwordConfirm = undefined;
  update.$set.passwordChangedAt = new Date();
  next();
});
userSchema.pre(/^find/, function (next) {
  // Filter out inactive (soft-deleted) users from all find queries
  this.find({ active: { $ne: false } });
  next();
});
userSchema.methods.comparePassword = async function (candidatePassword, password) {
  return await bcrypt.compare(candidatePassword, password);
};
userSchema.methods.checkPasswordChangedAfter = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return jwtTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
