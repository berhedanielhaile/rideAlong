const mongoose = require('mongoose');

const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
mongoose.set('strictQuery', false);

const app = require('./app');

const db = process.env.DATABASE
  ? process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD || '')
  : null;

const startServer = async () => {
  if (!db) {
    console.error('DATABASE environment variable is not defined');
    process.exit(1);
  }

  try {
    await mongoose.connect(db, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log('DB connection successful!');

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`listening from port ${port}`));
  } catch (err) {
    console.error('DB connection error:', err.message);
    console.error('Check your internet connection, Atlas IP access list, and database credentials.');
    process.exit(1);
  }
};

startServer();
