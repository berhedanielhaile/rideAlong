import axios from 'axios';
import { $, $$ } from './dom';
import { showAlert } from './alert';

async function readLocation() {
  if (!navigator.geolocation) return {};
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
      () => resolve({}),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 30000 },
    );
  });
}

async function runTripAction(btn, request, successMessage) {
  const actions = $$('button[data-accept-trip], button[data-decline-trip], button[data-next-status][data-trip-id]');
  const original = btn.textContent;
  actions.forEach((action) => {
    action.disabled = true;
  });
  btn.textContent = 'Updating...';
  try {
    await axios.patch(request.url, request.body);
    showAlert('success', successMessage);
    window.location.reload();
  } catch (error) {
    actions.forEach((action) => {
      action.disabled = false;
    });
    btn.textContent = original;
    showAlert('error', error.response?.data?.message || 'Could not update this trip.');
  }
}

export function initDriver() {
  const toggle = $('[data-driver-toggle]');
  if (toggle) {
    toggle.addEventListener('click', async () => {
      const goingOnline = !toggle.classList.contains('active');
      const location = goingOnline ? await readLocation() : {};
      try {
        const { data } = await axios.patch('/api/v1/user/me/status', {
          status: goingOnline ? 'available' : 'offline',
          ...location,
        });
        toggle.classList.toggle('active', data.data.status === 'available');
        const badge = $('[data-online-badge]');
        if (badge) {
          badge.textContent = data.data.status === 'available' ? 'Online and available' : 'Offline';
        }
        showAlert('success', data.data.status === 'available' ? 'You are online.' : 'You are offline.');
      } catch (error) {
        showAlert('error', error.response?.data?.message || 'Could not update status.');
      }
    });
  }

  $$('button[data-accept-trip]').forEach((btn) => {
    btn.addEventListener('click', () =>
      runTripAction(btn, { url: `/api/v1/trip/${btn.dataset.acceptTrip}/accept` }, 'Request accepted.'),
    );
  });

  $$('button[data-decline-trip]').forEach((btn) => {
    btn.addEventListener('click', () =>
      runTripAction(btn, { url: `/api/v1/trip/${btn.dataset.declineTrip}/decline` }, 'Request declined.'),
    );
  });

  $$('button[data-next-status][data-trip-id]').forEach((btn) => {
    btn.addEventListener('click', () =>
      runTripAction(
        btn,
        {
          url: `/api/v1/trip/${btn.dataset.tripId}/status`,
          body: { status: btn.dataset.nextStatus },
        },
        btn.dataset.nextStatus === 'cancelled' ? 'Trip cancelled.' : 'Trip updated.',
      ),
    );
  });

  const home = $('[data-driver-home]');
  if (!home?.dataset.userId) return;

  const requestFingerprint = () =>
    $$('button[data-accept-trip]', home)
      .map((btn) => btn.dataset.acceptTrip)
      .sort()
      .join(',');

  let lastIds = requestFingerprint();
  const hasActiveTrip = Boolean(home.querySelector('button[data-next-status][data-trip-id]'));

  window.setInterval(async () => {
    if (hasActiveTrip) return;
    try {
      const { data } = await axios.get(`/api/v1/user/${home.dataset.userId}/requests`);
      const ids = (data.data.requests || [])
        .map((trip) => String(trip._id))
        .sort()
        .join(',');
      if (ids !== lastIds) {
        lastIds = ids;
        window.location.reload();
      }
    } catch (error) {
      // Keep the driver screen usable if polling fails.
    }
  }, 8000);
}
