const express = require('express');
const {
  getHomepage,
  login,
  signup,
  showBookings,
  showDashboard,
  showTracking,
  showHistory,
  showWallet,
  showProfile,
  showDriverDashboard,
  showEarnings,
} = require('../controller/viewController');
const { isLoggedIn } = require('../controller/authController');

const router = express.Router();

router.get('/register', signup);
router.get('/login', login);
router.get('/', isLoggedIn, getHomepage);

router.use(isLoggedIn);
router.get('/dashboard', showDashboard);
router.get('/booking', showBookings);
router.get('/tracking/:trip', showTracking);
router.get('/history', showHistory);
router.get('/wallet', showWallet);
router.get('/profile', showProfile);
router.get('/driver', showDriverDashboard);
router.get('/earnings', showEarnings);

module.exports = router;
