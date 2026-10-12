const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const catchAsync = require('../utils/catchAsync');
const User = require('../model/user-Model');
const AppError = require('../utils/AppError');
const Email = require('../utils/email');

// ── Helper: create JWT and send it as an HTTPOnly cookie ──
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWTSECRET.trim(), {
    expiresIn: process.env.JWTEXPIRESIN,
  });

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  // Secure cookie options
  const cookieOptions = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    httpOnly: true, // Prevents XSS access to the cookie
    sameSite: 'lax', // CSRF protection
  };

  // Only send secure cookies over HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  return { token };
};

// ── SIGNUP ──
exports.signup = catchAsync(async (req, res, next) => {
  // 1) Validate required fields
  if (!req.body.email || !req.body.phoneNumber || !req.body.password || !req.body.passwordConfirm) {
    return next(new AppError('Please provide email, phone number, password, and password confirmation', 400));
  }

  // 2) Check if user already exists (by phone or email)
  const existingUser = await User.findOne({
    $or: [{ phoneNumber: req.body.phoneNumber }, { email: req.body.email }],
  });
  if (existingUser) {
    return next(new AppError('User already exists with this phone number or email. Please login instead.', 400));
  }

  // 3) Create user in database (role is always passenger for security)
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: 'passenger', // Never allow client to set role
  });

  // 4) Send welcome email
  const url = `${req.protocol}://${req.get('host')}/`;
  try {
    await new Email(newUser, url).sendWelcome();
  } catch (err) {
    // Continue even if email fails
    console.log('Error sending welcome email:', err.message);
  }

  // 5) Create JWT token and send as HTTPOnly cookie
  const { token } = createSendToken(newUser, 201, req, res);

  // 6) Send response (don't expose sensitive data)
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: {
        name: newUser.name,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role,
      },
    },
  });
});

// ── LOGIN ──
exports.login = catchAsync(async (req, res, next) => {
  // 1) Validate required fields
  if (!req.body.email || !req.body.password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 2) Search for user with email and check login attempts
  const user = await User.findOne({ email: req.body.email }).select('+password +loginAttempts +lockUntil');

  // 3) Check if account is locked (max login attempts protection)
  if (user && user.lockUntil && user.lockUntil > Date.now()) {
    const waitMinutes = Math.ceil((user.lockUntil - Date.now()) / 60000);
    return next(
      new AppError(
        `Account is temporarily locked due to too many failed login attempts. Try again in ${waitMinutes} minute(s).`,
        429,
      ),
    );
  }

  // 4) Verify credentials
  if (!user || !(await user.comparePassword(req.body.password, user.password))) {
    // Increment failed login attempts
    if (user) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      // Lock account after 5 failed attempts for 30 minutes
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
        await user.save({ validateBeforeSave: false });
        return next(new AppError('Too many failed login attempts. Account locked for 30 minutes.', 429));
      }

      await user.save({ validateBeforeSave: false });
    }
    return next(new AppError('Incorrect email or password', 401));
  }

  // 5) Reset login attempts on successful login
  if (user.loginAttempts > 0 || user.lockUntil) {
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save({ validateBeforeSave: false });
  }

  // 6) Create JWT token and send as HTTPOnly cookie
  const { token } = createSendToken(user, 200, req, res);

  // 7) Send response (don't expose sensitive data)
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: {
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    },
  });
});

// ── LOGOUT ──
exports.logOut = (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), // Expires in 10 seconds
    httpOnly: true,
    sameSite: 'lax',
  });
  res.status(200).json({ status: 'success' });
};

// ── PROTECT (auth middleware) ──
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Check if token exists (prioritize cookie, then authorization header)
  let token;
  if (req.cookies.jwt && req.cookies.jwt !== 'loggedout') {
    token = req.cookies.jwt;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // 2) Verify token
  let decoded;
  try {
    decoded = await promisify(jwt.verify)(token, process.env.JWTSECRET.trim());
  } catch (err) {
    return next(new AppError('Invalid token. Please log in again.', 401));
  }

  // 3) Check if user still exists
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  // 4) Check if user changed password after token was issued
  if (user.checkPasswordChangedAfter(decoded.iat)) {
    return next(new AppError('User recently changed password. Please log in again.', 401));
  }

  // Grant access to protected route
  req.user = user;
  res.locals.user = user;
  next();
});

// ── IS LOGGED IN (non-blocking check for rendered pages) ──
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt && req.cookies.jwt !== 'loggedout') {
    // 2) Verify token
    let decoded;
    try {
      decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWTSECRET.trim());
    } catch (err) {
      return next();
    }

    // 3) Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return next();
    }

    // 4) Check if user changed password after token was issued
    if (user.checkPasswordChangedAfter(decoded.iat)) return next();

    req.user = user;
    res.locals.user = user;
    return next();
  }
  return next();
});

// ── RESTRICT TO ROLES ──
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };

// ── FORGET PASSWORD ──
exports.forgetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on email
  if (!req.body.email) {
    return next(new AppError('Please provide email', 404));
  }
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email address', 404));
  }

  // 2) Generate random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it back as email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/user/resetPassword/${resetToken}`;

  try {
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email. Try again later!', 500));
  }
});

// ── RESET PASSWORD ──
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  if (!req.body.password || !req.body.passwordConfirm) {
    return next(new AppError('Please provide password and password confirmation', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) passwordChangedAt is updated automatically in the pre-save hook
  //    This invalidates all previously issued JWTs (JWT blacklist by timestamp)

  // 4) Log the user in, send JWT as HTTPOnly cookie
  const { token } = createSendToken(user, 200, req, res);

  res.status(200).json({
    status: 'success',
    token,
  });
});

// ── UPDATE PASSWORD (for logged-in users) ──
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if user exists
  if (!user) {
    return next(new AppError('User not found. Please login first!', 401));
  }

  // 3) Check if POSTed password is correct
  if (!req.body.passwordCurrent || !req.body.password || !req.body.passwordConfirm) {
    return next(new AppError('Please provide current password, new password, and password confirmation', 400));
  }

  if (!(await user.comparePassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }

  // 4) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 5) passwordChangedAt is updated in pre-save hook, invalidating old tokens

  // 6) Log user in with new token, send as HTTPOnly cookie
  const { token } = createSendToken(user, 200, req, res);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: {
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    },
  });
});
