const express = require('express');
const {
  getTripPreview,
  getNearbyDriversPreview,
  createTrip,
  getTrip,
  acceptTrip,
  updateTripStatus,
  declineTrip,
  recordMeterReading,
} = require('../controller/tripController');
const { protect, restrictTo } = require('../controller/authController');

const router = express.Router({ mergeParams: true });

router.use(protect);
router.route('/preview').post(getTripPreview);
router.route('/nearby').post(getNearbyDriversPreview);
router.route('/').post(restrictTo('passenger'), createTrip);
router.route('/:id').get(getTrip);
router.route('/:id/accept').patch(restrictTo('driver'), acceptTrip);
router.route('/:id/decline').patch(restrictTo('driver'), declineTrip);
router.route('/:id/status').patch(updateTripStatus);
router.route('/:id/meter').post(restrictTo('driver', 'admin'), recordMeterReading);

module.exports = router;
