const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  const uri = process.env.DATABASE
    ? process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD || '')
    : null;
  if (!uri) {
    throw new Error('DATABASE environment variable is not defined');
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 20000,
  });
  return mongoose.connection;
};

module.exports = connectDB;
