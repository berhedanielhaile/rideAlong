const dotenv = require('dotenv');
const connectDB = require('../utils/connectDB');
const app = require('../app');

dotenv.config({ path: './config.env' });

module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
