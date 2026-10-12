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

  $$('[data-accept-trip]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await axios.patch(`/api/v1/trip/${btn.dataset.acceptTrip}/accept`);
        window.location.reload();
      } catch (error) {
        showAlert('error', error.response?.data?.message || 'Could not accept trip.');
      }
    });
  });

  $$('[data-decline-trip]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await axios.patch(`/api/v1/trip/${btn.dataset.declineTrip}/decline`);
        window.location.reload();
      } catch (error) {
        showAlert('error', error.response?.data?.message || 'Could not decline trip.');
      }
    });
  });

  $$('[data-trip-status]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await axios.patch(`/api/v1/trip/${btn.dataset.tripId}/status`, { status: btn.dataset.tripStatus });
        window.location.reload();
      } catch (error) {
        showAlert('error', error.response?.data?.message || 'Could not update trip.');
      }
    });
  });

  const home = $('[data-driver-home]');
  if (home?.dataset.userId) {
    window.setInterval(async () => {
      try {
        const { data } = await axios.get(`/api/v1/user/${home.dataset.userId}/requests`);
        const incoming = home.querySelectorAll('[data-accept-trip]').length;
        if (data.data.count !== incoming) window.location.reload();
      } catch (error) {
        // Keep the driver screen usable if polling fails.
      }
    }, 8000);
  }
}
