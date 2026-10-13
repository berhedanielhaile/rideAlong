const dotenv = require('dotenv');
const connectDB = require('./utils/connectDB');
const app = require('./app');

dotenv.config({ path: './config.env' });

const startServer = async () => {
  try {
    await connectDB();
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
