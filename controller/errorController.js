const AppError = require('../utils/AppError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateErrorDB = (err) => {
  const match = err.errmsg.match(/"([^"]+)"/);
  const value = match ? match[1] : 'unknown';
  const message = `Duplicate name value: "${value}", please enter another one!`;
  return new AppError(message, 400);
};
const handleValidationError = (err) => {
  const error = err.errors;
  const errorObj = Object.values(error)
    .map((el) => el.message)
    .join('. ');
  const message = `Invalid data: ${errorObj}`;
  return new AppError(message, 400);
};
const handlejwtError = () => new AppError('Invalid token ,please log in again', 401);
const handleTokenExpiredError = () => new AppError('your token has been expired! please log in again', 401);
const sendErrorDev = (err, req, res) => {
  //API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  //rendered website
  console.log('Error 💥💥💥', err);
  return res.status(err.statusCode).send(err.message);
};

const sendErrorPro = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    console.log('Error 💥💥💥', err);
    return res.status(err.statusCode).json({
      status: 'Something went wrong!',
      message: 'Please try again later!',
    });
  }

  if (err.isOperational) {
    return res.status(err.statusCode).send(err.message);
  }
  console.log('Error 💥💥💥', err);
  return res.status(500).send('Please try again later!');
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (err.name === 'ValidationError') err = handleValidationError(err);

  if (process.env.NODE_ENV === 'development') return sendErrorDev(err, req, res);

  let error = { ...err };
  error.message = err.message;
  error.name = err.name;
  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateErrorDB(error);
  if (error.name === 'ValidationError') error = handleValidationError(error);
  if (error.name === 'JsonWebTokenError') error = handlejwtError();
  if (error.name === 'TokenExpiredError') error = handleTokenExpiredError();
  return sendErrorPro(error, req, res);
};
