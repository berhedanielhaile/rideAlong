import axios from 'axios';

const tripStatuses = ['requested', 'accepted', 'arrived', 'picked_up', 'completed'];
const statusLabels = {
  requested: 'Ride requested',
  accepted: 'Driver on the way',
  arrived: 'Driver has arrived',
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

const toLngLat = (latlng) => (latlng ? [latlng[1], latlng[0]] : null);

const haversineKm = (a, b) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLon = toRad(b[0] - a[0]);
  const x =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

const pointAlong = (coordinates, fraction) => {
  if (!Array.isArray(coordinates) || coordinates.length === 0) return null;
  if (coordinates.length === 1 || fraction <= 0) return coordinates[0];
  if (fraction >= 1) return coordinates[coordinates.length - 1];
  let total = 0;
  const segments = [];
  for (let i = 1; i < coordinates.length; i += 1) {
    const length = haversineKm(coordinates[i - 1], coordinates[i]);
    segments.push(length);
    total += length;
  }
  if (total === 0) return coordinates[coordinates.length - 1];
  let remaining = total * fraction;
  for (let i = 0; i < segments.length; i += 1) {
    if (remaining <= segments[i]) {
      const t = segments[i] === 0 ? 0 : remaining / segments[i];
      const start = coordinates[i];
      const end = coordinates[i + 1];
      return [start[0] + (end[0] - start[0]) * t, start[1] + (end[1] - start[1]) * t];
    }
    remaining -= segments[i];
  }
  return coordinates[coordinates.length - 1];
};

const lerpLngLat = (from, to, fraction) => {
  if (!from) return to;
  if (!to) return from;
  const t = Math.min(1, Math.max(0, fraction));
  return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t];
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
  let motionInterval;
  let isRefreshing = false;
  let latestTrip = null;
  let hasFittedRoute = false;

  function renderStatus(status) {
    const currentIndex = tripStatuses.indexOf(status);
    trackingPage.dataset.tripStatus = status;
    if (statusLabel) statusLabel.textContent = statusLabels[status] || status;

    stages.forEach((stage) => {
      const stageIndex = tripStatuses.indexOf(stage.dataset.tripStage);
      const bullet = stage.querySelector('.bullet');
      const isComplete = status === 'completed' || (currentIndex >= 0 && stageIndex < currentIndex);
      const isCurrent = status !== 'cancelled' && stageIndex === currentIndex;
      if (bullet) {
        bullet.classList.toggle('done', isComplete);
        bullet.classList.toggle('now', isCurrent);
      }
      stage.hidden = status === 'cancelled' && stageIndex > 0;
    });

    if (!message) return;
    if (status === 'cancelled') {
      message.textContent = 'This ride was cancelled.';
    } else if (status === 'completed') {
      message.textContent = 'Your ride is complete.';
    } else if (status === 'picked_up') {
      message.textContent = 'Live tracking is on. Your driver is moving toward drop-off.';
    } else if (status === 'arrived') {
      message.textContent = 'Your driver is at pickup.';
    } else if (status === 'accepted') {
      message.textContent = 'Driver is heading to you. Location updates live.';
    } else {
      message.textContent = 'Looking for your driver. This page updates automatically.';
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

  function vehiclePosition(tripLike) {
    const pickupCoords = toLatLng(tripLike.pickup?.coordinates || tripLike.pickup?.location?.coordinates);
    const dropoffCoords = toLatLng(tripLike.dropoff?.coordinates || tripLike.dropoff?.location?.coordinates);
    const driverLocation =
      tripLike.meter?.location?.coordinates ||
      tripLike.driver?.location ||
      tripLike.driver_id?.driverProfile?.current_location?.coordinates;
    const routeCoords = tripLike.metrics?.route?.coordinates;
    const status = tripLike.status;
    const started = new Date(tripLike.pickup?.timeStamp || tripLike.createdAt || Date.now()).getTime();
    const durationMs = Math.max(60, Number(tripLike.metrics?.duration_seconds) || 600) * 1000;
    const elapsed = Math.max(0, Date.now() - started);

    if (driverLocation && (status === 'requested' || status === 'accepted')) {
      const from = toLatLng(driverLocation);
      if (status === 'accepted' && pickupCoords && from) {
        const approach = Math.min(0.92, elapsed / Math.max(durationMs * 0.35, 60000));
        return toLatLng(lerpLngLat(toLngLat(from), toLngLat(pickupCoords), approach));
      }
      return from;
    }
    if (status === 'arrived' && pickupCoords) return pickupCoords;
    if (status === 'completed' && dropoffCoords) return dropoffCoords;

    const meterKm = Number(tripLike.meter?.distance_km);
    const tripKm = Number(tripLike.metrics?.distance_km) || 0;
    let fraction = tripKm > 0 && meterKm > 0 ? meterKm / tripKm : elapsed / durationMs;
    if (status !== 'picked_up') fraction = Math.min(fraction, 0.08);
    fraction = Math.min(0.98, Math.max(0, fraction));
    if (Array.isArray(routeCoords) && routeCoords.length > 1) return toLatLng(pointAlong(routeCoords, fraction));
    if (pickupCoords && dropoffCoords) {
      return toLatLng(lerpLngLat(toLngLat(pickupCoords), toLngLat(dropoffCoords), fraction));
    }
    return toLatLng(driverLocation);
  }

  function drawTrip(tripLike, { fit = false } = {}) {
    if (!mapController || !tripLike) return;
    const pickupCoords = toLatLng(tripLike.pickup?.coordinates || tripLike.pickup?.location?.coordinates);
    const dropoffCoords = toLatLng(tripLike.dropoff?.coordinates || tripLike.dropoff?.location?.coordinates);
    if (pickupCoords) mapController.setPickup(pickupCoords);
    if (dropoffCoords) mapController.setDestination(dropoffCoords);

    const route = tripLike.metrics?.route;
    const geometry =
      route && Array.isArray(route.coordinates) && route.coordinates.length
        ? route
        : pickupCoords && dropoffCoords
          ? { type: 'LineString', coordinates: [toLngLat(pickupCoords), toLngLat(dropoffCoords)] }
          : null;
    if (geometry) mapController.setRoute(geometry, [], { fit });

    const car = vehiclePosition(tripLike);
    const driverName = tripLike.driver?.name || tripLike.driver_id?.name || 'Driver';
    if (car) mapController.setVehicle(car, driverName);
    window.requestAnimationFrame(() => mapController.invalidateSize());
  }

  function applyTrip(trip) {
    if (!trip) return;
    latestTrip = trip;
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
    drawTrip(trip, { fit: !hasFittedRoute });
    hasFittedRoute = true;
    if (['completed', 'cancelled'].includes(trip.status)) {
      window.clearInterval(pollingInterval);
      window.clearInterval(motionInterval);
    }
  }

  async function refreshTrip() {
    if (isRefreshing) return;
    isRefreshing = true;
    try {
      const { data: result } = await axios.get(`/api/v1/trip/${encodeURIComponent(tripId)}`);
      const trip = result.data?.pickup ? result.data : result.data?.data || result.data;
      applyTrip(trip);
    } catch (error) {
      if (message) {
        message.textContent =
          error.response?.data?.message || error.message || 'Unable to refresh trip status. Retrying shortly.';
      }
    } finally {
      isRefreshing = false;
    }
  }

  const boot = readBootData();
  applyTrip(boot || { id: tripId, status: trackingPage.dataset.tripStatus, metrics: {}, fare: {}, pickup: {}, dropoff: {} });
  if (!['completed', 'cancelled'].includes(trackingPage.dataset.tripStatus)) {
    pollingInterval = window.setInterval(refreshTrip, 4000);
    motionInterval = window.setInterval(() => {
      if (latestTrip && !['completed', 'cancelled'].includes(latestTrip.status)) {
        drawTrip(latestTrip, { fit: false });
      }
    }, 1000);
    refreshTrip();
  }
}
