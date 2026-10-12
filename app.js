const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const AppError = require('./utils/AppError');

const userRouter = require('./routes/userRouter');
const tripRouter = require('./routes/tripRouter');
const viewRouter = require('./routes/viewRoute');
const globalErrorHandler = require('./controller/errorController');

const app = express();

// 1) GLOBAL MIDDLEWARES

// Set security HTTP headers (helmet) with CSP configured for app pages
app.use(
  helmet({
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
        workerSrc: ["'self'", 'blob:'],
        childSrc: ["'self'", 'blob:'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        connectSrc: [
          "'self'",
          'https://tile.openstreetmap.org',
          'https://a.tile.openstreetmap.org',
          'https://b.tile.openstreetmap.org',
          'https://c.tile.openstreetmap.org',
          'https://photon.komoot.io',
          'https://router.project-osrm.org',
          ...(process.env.NODE_ENV === 'production' ? [] : ['ws://127.0.0.1:*']),
        ],
      },
    },
  }),
);

// Enable CORS with credentials support
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

// Rate limiting - general API (DOS & brute force protection)
const globalLimiter = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many requests from this IP, please try again in 15 minutes!',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

// Stricter rate limiter for auth routes (brute force protection)
const authLimiter = rateLimit({
  max: 10,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many login attempts from this IP, please try again in 15 minutes!',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/v1/user/login', authLimiter);
app.use('/api/v1/user/signup', authLimiter);
app.use('/api/v1/user/forgetPassword', authLimiter);

// Body parsing middleware with size limit (DOS protection)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Cookie parser
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent HTTP parameter pollution
app.use(
  hpp({
    whitelist: ['status', 'role', 'rating'],
  }),
);

// View engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 2) ROUTES — views first so / /login /signup render Pug instead of public/*.html
app.use('/', viewRouter);
app.use(express.static(path.join(__dirname, '/public')));
app.get('/bundle.js.map', (req, res, next) =>
  res.sendFile(path.join(__dirname, 'public/js/bundle.js.map'), (err) => err && next(err)),
);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/trip', tripRouter);

app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => res.status(204).end());

// 3) ERROR HANDLING
app.use((req, res, next) => next(new AppError(`This route ${req.originalUrl} is not defined on this server`, 404)));
app.use(globalErrorHandler);

module.exports = app;
