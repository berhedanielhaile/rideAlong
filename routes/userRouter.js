const express = require('express');

const tripRouter = require('./tripRouter');
const {
  getAllUsers,
  updateUser,
  getUser,
  deleteUser,
  updateMe,
  deleteCurrentUser,
  topUpWallet,
  updateDriverStatus,
  addSavedPlace,
  removeSavedPlace,
  setDefaultPayment,
} = require('../controller/userController');
const { getDriverRequests, getAllTrips, getUserTripStats } = require('../controller/tripController');
const {
  login,
  signup,
  protect,
  restrictTo,
  logOut,
  forgetPassword,
  resetPassword,
  updatePassword,
} = require('../controller/authController');

const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);
router.post('/forgetPassword', forgetPassword);
router.post('/resetPassword/:token', resetPassword);
router.post('/logout', protect, logOut);

router.use(protect);

router.patch('/updateCurrentPassword', updatePassword);
router.patch('/me', updateMe);
router.delete('/me', deleteCurrentUser);
router.post('/me/wallet', topUpWallet);
router.patch('/me/status', updateDriverStatus);
router.post('/me/places', addSavedPlace);
router.delete('/me/places/:placeId', removeSavedPlace);
router.patch('/me/payment', setDefaultPayment);

router.route('/:id/requests').get(restrictTo('driver', 'admin'), getDriverRequests);
router.route('/:id/trips').get(getAllTrips);
router.route('/:id/stats').get(getUserTripStats);

router.route('/').get(restrictTo('admin'), getAllUsers);
router.route('/:id').get(getUser).patch(updateUser).delete(restrictTo('admin'), deleteUser);

module.exports = router;
