import axios from 'axios';

const tripStatuses = ['requested', 'accepted', 'arrived', 'picked_up', 'completed'];
const statusLabels = {
  requested: 'Ride requested',
  accepted: 'Driver accepted',
  arrived: 'Driver arrived',
  picked_up: 'Ride in progress',
  completed: 'Ride completed',
  cancelled: 'Ride cancelled',
};

const initialsFor = (name = '') =>
  name
    .split(' ')
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'RA';

const toLatLng = (coordinates) => {
  if (!Array.isArray(coordinates) || coordinates.length < 2) return null;
  const [lng, lat] = coordinates;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return [lat, lng];
};

const readBootData = () => {
  const bootEl = document.getElementById('trip-boot');
  if (!bootEl || !bootEl.textContent.trim()) return null;
  try {
    return JSON.parse(bootEl.textContent);
  } catch (error) {
    return null;
  }
};

export function initTracking(mapController) {
  const trackingPage = document.querySelector('[data-trip-id]');
  if (!trackingPage) return;

  const statusLabel = trackingPage.querySelector('[data-trip-status-label]');
  const message = trackingPage.querySelector('[data-tracking-message]');
  const routeCaption = trackingPage.querySelector('[data-trip-route] strong') || trackingPage.querySelector('[data-trip-route]');
  const stages = Array.from(trackingPage.querySelectorAll('[data-trip-stage]'));
  const tripId = trackingPage.dataset.tripId;
  let pollingInterval;
  let isRefreshing = false;

  function renderStatus(status) {
    const currentIndex = tripStatuses.indexOf(status);
    trackingPage.dataset.tripStatus = status;
    statusLabel.textContent = statusLabels[status] || status;

    stages.forEach((stage) => {
      const stageIndex = tripStatuses.indexOf(stage.dataset.tripStage);
      const bullet = stage.querySelector('.bullet');
      const isComplete = status === 'completed' || (currentIndex >= 0 && stageIndex < currentIndex);
      const isCurrent = status !== 'cancelled' && stageIndex === currentIndex;
      bullet.classList.toggle('done', isComplete);
      bullet.classList.toggle('now', isCurrent);
      stage.hidden = status === 'cancelled' && stageIndex > 0;
    });

    if (status === 'cancelled') {
      message.textContent = 'This ride was cancelled.';
      window.clearInterval(pollingInterval);
    } else if (status === 'completed') {
      message.textContent = 'Your ride is complete.';
      window.clearInterval(pollingInterval);
    } else {
      message.textContent = 'Trip status updates automatically.';
    }
  }

  function renderMetrics(metrics = {}, fare = {}, meter = null) {
    const liveMeter = Boolean(meter && (meter.recorded_at || meter.fare != null));
    const distanceEl = trackingPage.querySelector('[data-trip-distance]');
    const distanceLabelEl = trackingPage.querySelector('[data-trip-distance-label]');
    const durationEl = trackingPage.querySelector('[data-trip-duration]');
    const waitingEl = trackingPage.querySelector('[data-trip-waiting]');
    const fareEl = trackingPage.querySelector('[data-trip-fare]');
    const fareLabelEl = trackingPage.querySelector('[data-trip-fare-label]');
    const distanceKm = liveMeter ? meter.distance_km : metrics.distance_km;
    const fareAmount = liveMeter ? meter.fare : fare.total_fare;
    if (distanceEl) distanceEl.textContent = `${Number(distanceKm || 0).toFixed(2)} km`;
    if (distanceLabelEl) distanceLabelEl.textContent = liveMeter ? 'Meter distance' : 'Estimated distance';
    if (durationEl) durationEl.textContent = `${Math.round((metrics.duration_seconds || 0) / 60)} min`;
    if (waitingEl) waitingEl.textContent = `${Math.round(((meter && meter.waiting_seconds) || 0) / 60)} min`;
    if (fareEl) fareEl.textContent = `ETB ${Number(fareAmount || 0).toFixed(2)}`;
    if (fareLabelEl) fareLabelEl.textContent = liveMeter ? 'Meter fare' : 'Estimated fare';
  }

  function renderDriver(driver = {}, vehicle = {}) {
    const name = driver.name || 'Driver details unavailable';
    const nameEl = trackingPage.querySelector('[data-driver-name]');
    const avatarEl = trackingPage.querySelector('[data-driver-avatar]');
    const ratingEl = trackingPage.querySelector('[data-driver-rating]');
    const modelEl = trackingPage.querySelector('[data-vehicle-model]');
    const plateEl = trackingPage.querySelector('[data-vehicle-plate]');
    if (nameEl) nameEl.textContent = name;
    if (avatarEl) avatarEl.textContent = initialsFor(name);
    if (ratingEl) {
      ratingEl.textContent =
        driver.rating != null || driver.driverProfile?.rating != null
          ? Number(driver.rating ?? driver.driverProfile.rating).toFixed(1)
          : 'No rating';
    }
    if (modelEl) modelEl.textContent = vehicle.model || driver.vehicle?.model || '';
    if (plateEl) plateEl.textContent = vehicle.plate_number || driver.vehicle?.plate_number || '';
  }

  function drawTrip(tripLike) {
    if (!mapController) return;
    const pickupCoords = toLatLng(tripLike.pickup?.coordinates || tripLike.pickup?.location?.coordinates);
    const dropoffCoords = toLatLng(tripLike.dropoff?.coordinates || tripLike.dropoff?.location?.coordinates);
    if (pickupCoords) mapController.setPickup(pickupCoords);
    if (dropoffCoords) mapController.setDestination(dropoffCoords);

    const route = tripLike.metrics?.route;
    const geometry =
      route && Array.isArray(route.coordinates) && route.coordinates.length
        ? route
        : pickupCoords && dropoffCoords
          ? { type: 'LineString', coordinates: [[pickupCoords[1], pickupCoords[0]], [dropoffCoords[1], dropoffCoords[0]]] }
          : null;
    if (geometry) mapController.setRoute(geometry);

    const driverLocation =
      tripLike.driver?.location || tripLike.driver_id?.driverProfile?.current_location?.coordinates;
    const driverName = tripLike.driver?.name || tripLike.driver_id?.name || 'Driver';
    if (driverLocation) {
      mapController.setDrivers([{ name: driverName, location: driverLocation, distanceMeters: 0 }]);
    }
    window.requestAnimationFrame(() => mapController.invalidateSize());
  }

  function applyTrip(trip) {
    if (!trip) return;
    const driverDoc = trip.driver_id && typeof trip.driver_id === 'object' ? trip.driver_id : trip.driver;
    renderStatus(trip.status);
    renderMetrics(trip.metrics, trip.fare || trip.payment?.fare_breakdown, trip.meter);
    renderDriver(
      {
        name: driverDoc?.name,
        rating: driverDoc?.driverProfile?.rating ?? trip.driver?.rating,
        vehicle: driverDoc?.driverProfile?.active_vehicle,
        location: driverDoc?.driverProfile?.current_location?.coordinates || trip.driver?.location,
      },
      trip.vehicle_snapshot || driverDoc?.driverProfile?.active_vehicle || {},
    );
    if (routeCaption && trip.pickup && trip.dropoff) {
      const pickupLabel = trip.pickup.label || trip.pickup.adress || 'Pickup';
      const dropoffLabel = trip.dropoff.label || trip.dropoff.adress || 'Drop-off';
      routeCaption.textContent = `${pickupLabel} to ${dropoffLabel}`;
    }
    drawTrip(trip);
  }

  async function refreshTrip() {
    if (isRefreshing) return;
    isRefreshing = true;
    try {
      const { data: result } = await axios.get(`/api/v1/trip/${encodeURIComponent(tripId)}`);
      applyTrip(result.data);
    } catch (error) {
      message.textContent =
        error.response?.data?.message || error.message || 'Unable to refresh trip status. Retrying shortly.';
    } finally {
      isRefreshing = false;
    }
  }

  const boot = readBootData();
  applyTrip(boot || { id: tripId, status: trackingPage.dataset.tripStatus, metrics: {}, fare: {}, pickup: {}, dropoff: {} });
  if (!['completed', 'cancelled'].includes(trackingPage.dataset.tripStatus)) {
    pollingInterval = window.setInterval(refreshTrip, 5000);
    refreshTrip();
  }
}
