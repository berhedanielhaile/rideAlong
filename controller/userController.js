const User = require('../model/user-Model');
const Trip = require('../model/trip-model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select('-password -passwordConfirm -passwordResetToken -passwordResetExpires');

  res.status(200).json({
    status: 'success',
    data: {
      count: users.length,
      users: users.map((user) => ({
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        photo: user.photo,
        createdAt: user.createdAt,
      })),
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  // Users can only view their own profile (unless admin)
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    return next(new AppError('You can only view your own profile', 403));
  }

  const user = await User.findById(req.params.id).select(
    '-password -passwordConfirm -passwordResetToken -passwordResetExpires',
  );

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        photo: user.photo,
        createdAt: user.createdAt,
      },
    },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  // Users can only update their own profile (unless admin)
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    return next(new AppError('You can only update your own profile', 403));
  }

  // Prevent non-admin users from updating sensitive fields
  if (req.user.role !== 'admin') {
    delete req.body.role;
  }

  // Never allow password updates through this route
  delete req.body.password;
  delete req.body.passwordConfirm;

  // Filter allowed fields
  const filteredBody = {};
  const allowedFields = ['name', 'email', 'phoneNumber', 'photo', 'role'];
  allowedFields.forEach((field) => {
    if (req.body[field]) {
      filteredBody[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        photo: user.photo,
        role: user.role,
      },
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, { active: false });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user tries to update password
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for updating passwords. Please use /updateCurrentPassword', 400));
  }

  // 2) Filter out unwanted field names that are not allowed to be updated
  const filteredBody = {};
  const allowedFields = ['name', 'email', 'phoneNumber', 'photo'];
  allowedFields.forEach((field) => {
    if (req.body[field]) {
      filteredBody[field] = req.body[field];
    }
  });

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        photo: updatedUser.photo,
        role: updatedUser.role,
      },
    },
  });
});
exports.deleteCurrentUser = catchAsync(async (req, res, next) => {
  // 1) Get current user from protect middleware
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // 2) Check if user has active trips
  const activeTrips = await Trip.find({
    $or: [{ driver_id: user._id }, { passenger_id: user._id }],
    status: { $in: ['requested', 'accepted', 'arrived', 'picked_up'] },
  });

  if (activeTrips.length > 0) {
    return next(
      new AppError('Cannot delete account with active trips. Please complete or cancel your active trips first.', 400),
    );
  }

  // 3) Deactivate user (soft-delete — keep the data in the database)
  await User.findByIdAndUpdate(user._id, { active: false });

  // 4) Clear JWT cookie
  res.clearCookie('jwt');

  // 5) Send response
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.topUpWallet = catchAsync(async (req, res, next) => {
  const amount = Number(req.body.amount);
  if (!Number.isFinite(amount) || amount < 1) {
    return next(new AppError('Please enter an amount of at least ETB 1', 400));
  }
  if (amount > 100000) {
    return next(new AppError('Top-up amount cannot exceed ETB 100,000', 400));
  }
  const method =
    typeof req.body.method === 'string' && req.body.method.trim() ? req.body.method.trim() : 'Wallet top-up';

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      $inc: { 'passengerProfile.wallet_balance': amount },
      $push: {
        'passengerProfile.wallet_history': {
          type: 'topup',
          amount,
          note: method,
          createdAt: new Date(),
        },
      },
    },
    { new: true, runValidators: true },
  );

  res.status(200).json({
    status: 'success',
    data: {
      wallet_balance: user.passengerProfile.wallet_balance,
    },
  });
});

exports.updateDriverStatus = catchAsync(async (req, res, next) => {
  if (req.user.role !== 'driver' && req.user.role !== 'admin') {
    return next(new AppError('Only drivers can update online status', 403));
  }

  const { status } = req.body;
  if (!['available', 'offline', 'break'].includes(status)) {
    return next(new AppError('Status must be available, offline, or break', 400));
  }

  const driver = await User.findById(req.user.id);
  if (driver.driverProfile && driver.driverProfile.status === 'on_trip' && status !== 'offline') {
    return next(new AppError('Finish your current trip before changing status', 400));
  }

  const update = { 'driverProfile.status': status };
  const lng = Number(req.body.longitude);
  const lat = Number(req.body.latitude);
  if (Number.isFinite(lng) && Number.isFinite(lat)) {
    update['driverProfile.current_location'] = { type: 'Point', coordinates: [lng, lat] };
  }

  const user = await User.findByIdAndUpdate(req.user.id, update, { new: true, runValidators: true });

  res.status(200).json({
    status: 'success',
    data: {
      status: user.driverProfile.status,
    },
  });
});

exports.addSavedPlace = catchAsync(async (req, res, next) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const adress = typeof req.body.adress === 'string' ? req.body.adress.trim() : '';
  if (!name || !adress) {
    return next(new AppError('Please provide a place name and address', 400));
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      $push: {
        'passengerProfile.saved_Places': {
          name,
          adress,
          coordinates: Array.isArray(req.body.coordinates) ? req.body.coordinates : undefined,
        },
      },
    },
    { new: true },
  );

  res.status(201).json({
    status: 'success',
    data: {
      saved_Places: user.passengerProfile.saved_Places,
    },
  });
});

exports.removeSavedPlace = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $pull: { 'passengerProfile.saved_Places': { _id: req.params.placeId } } },
    { new: true },
  );

  res.status(200).json({
    status: 'success',
    data: {
      saved_Places: user.passengerProfile.saved_Places,
    },
  });
});

exports.setDefaultPayment = catchAsync(async (req, res, next) => {
  const method = typeof req.body.method === 'string' ? req.body.method.trim() : '';
  if (!method) return next(new AppError('Please choose a payment method', 400));

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { 'passengerProfile.default_payment_method': method },
    { new: true },
  );

  res.status(200).json({
    status: 'success',
    data: {
      default_payment_method: user.passengerProfile.default_payment_method,
    },
  });
});
