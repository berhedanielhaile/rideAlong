import axios from 'axios';

const PHOTON_URL = 'https://photon.komoot.io';

export function initBooking(mapController) {
  // 1) DOM ELEMENT
  const pickupInput = document.getElementById('pickup');
  const destinationInput = document.getElementById('destination');
  const confirmButton = document.querySelector('[data-confirm-booking]');
  const driverList = document.getElementById('nearby-drivers');
  const mapCaption = document.getElementById('map-caption');
  if (!pickupInput || !destinationInput || !mapController) return;

  const state = {
    pickup: null,
    destination: null,
    preview: null,
    nearbyDrivers: [],
    selectedDriverId: null,
    rideType: 'standard',
    previewSequence: 0,
    nearbySequence: 0,
  };

  function status(message, isError = false) {
    mapCaption.replaceChildren();
    const heading = document.createElement('strong');
    heading.textContent = message;
    mapCaption.append(heading);
    mapCaption.classList.toggle('is-error', isError);
  }

  const money = (amount) => `ETB ${Number(amount).toFixed(2)}`;
  const labelFor = (feature) => {
    const properties = feature.properties || {};
    return [properties.name, properties.street, properties.city || properties.locality, properties.state]
      .filter((part, index, parts) => part && parts.indexOf(part) === index)
      .join(', ');
  };

  async function geocode(query, center) {
    const params = new URLSearchParams({ q: query, limit: '1' });
    if (center) {
      params.set('lat', String(center[0]));
      params.set('lon', String(center[1]));
    }
    const { data } = await axios.get(`${PHOTON_URL}/api/?${params}`);

    const feature = data.features?.[0];
    if (!feature) throw new Error('Could not find that location.');
    return {
      label: labelFor(feature),
      coordinates: [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
    };
  }

  async function reverseGeocode(coordinates) {
    const params = new URLSearchParams({ lat: String(coordinates[0]), lon: String(coordinates[1]) });
    const { data } = await axios.get(`${PHOTON_URL}/reverse?${params}`);

    return data.features?.[0] ? labelFor(data.features[0]) : '';
  }

  function showSuggestionMessage(input, list, message) {
    list.replaceChildren();
    const option = document.createElement('div');
    option.className = 'location-suggestion-message';
    option.setAttribute('role', 'option');
    option.setAttribute('aria-disabled', 'true');
    option.textContent = message;
    list.append(option);
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }

  function renderSuggestions(input, list, features, selectLocation) {
    list.replaceChildren();
    features.forEach((feature) => {
      const label = labelFor(feature);
      if (!label) return;
      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'location-suggestion';
      option.setAttribute('role', 'option');
      option.textContent = label;
      option.addEventListener('click', () => {
        const [longitude, latitude] = feature.geometry.coordinates;
        selectLocation(label, [latitude, longitude]);
        list.hidden = true;
        input.setAttribute('aria-expanded', 'false');
      });
      list.append(option);
    });
    if (list.childElementCount === 0) {
      showSuggestionMessage(input, list, 'No matching locations found.');
      return;
    }
    list.hidden = false;
    input.setAttribute('aria-expanded', String(!list.hidden));
  }

  function attachAutocomplete(input, list, which) {
    let debounce;
    let requestController;
    let searchSequence = 0;
    input.addEventListener('input', () => {
      window.clearTimeout(debounce);
      requestController?.abort();
      searchSequence += 1;
      state[which] = null;
      state.preview = null;
      state.selectedDriverId = null;
      state.previewSequence += 1;
      confirmButton.disabled = true;
      renderFare();
      mapController.clearLocation(which);
      driverList.textContent = 'Choose a suggested location to preview nearby drivers.';
      status('Choose a suggested location to update the route.');
      if (input.value.trim().length < 3) {
        list.hidden = true;
        input.setAttribute('aria-expanded', 'false');
        return;
      }
      const query = input.value.trim();
      showSuggestionMessage(input, list, 'Searching locations...');
      const sequence = searchSequence;
      debounce = window.setTimeout(async () => {
        requestController = new AbortController();
        const params = new URLSearchParams({ q: query, limit: '5', lang: 'en' });
        if (state.pickup) {
          params.set('lat', String(state.pickup.coordinates[0]));
          params.set('lon', String(state.pickup.coordinates[1]));
        }
        try {
          const { data: results } = await axios.get(`${PHOTON_URL}/api/?${params}`, {
            signal: requestController.signal,
          });
          if (sequence !== searchSequence) return;
          renderSuggestions(input, list, results.features || [], (label, coordinates) => {
            state[which] = { label, coordinates };
            input.value = label;
            updatePreview();
          });
        } catch (error) {
          if (!axios.isCancel(error) && sequence === searchSequence) {
            showSuggestionMessage(input, list, 'Could not load locations. Check your connection and try again.');
            status('Location suggestions are unavailable. Please try again.', true);
          }
        }
      }, 250);
    });
    input.addEventListener('blur', () => {
      window.setTimeout(() => {
        list.hidden = true;
        input.setAttribute('aria-expanded', 'false');
      }, 150);
    });
  }

  function renderDrivers(drivers) {
    const previousId = state.selectedDriverId;
    driverList.replaceChildren();
    state.selectedDriverId = null;
    if (!drivers.length) {
      const empty = document.createElement('p');
      empty.className = 'booking-status';
      empty.textContent = 'No available drivers nearby right now.';
      driverList.append(empty);
      return;
    }

    drivers.forEach((driver) => {
      const row = document.createElement('div');
      row.className = 'driver-pick';
      row.dataset.driverId = String(driver._id);
      row.setAttribute('role', 'button');
      row.setAttribute('tabindex', '0');
      row.setAttribute('aria-pressed', 'false');
      const marker = document.createElement('span');
      marker.className = 'avatar';
      marker.textContent = driver.name
        .split(' ')
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join('')
        .toUpperCase();
      const details = document.createElement('span');
      const name = document.createElement('strong');
      name.textContent = driver.name;
      const rating = document.createElement('small');
      rating.textContent = `${Number(driver.rating || 0).toFixed(1)} · ${Math.max(1, Math.round(driver.distanceMeters / 250))} min away`;
      details.append(name, document.createElement('br'), rating);
      row.append(marker, details);

      const selectDriver = () => {
        driverList.querySelectorAll('.driver-pick').forEach((option) => {
          option.classList.remove('selected');
          option.setAttribute('aria-pressed', 'false');
        });
        row.classList.add('selected');
        row.setAttribute('aria-pressed', 'true');
        state.selectedDriverId = row.dataset.driverId;
        confirmButton.disabled = !state.preview?.[`${state.rideType}Fares`];
      };

      row.addEventListener('click', () => {
        selectDriver();
      });
      row.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectDriver();
        }
      });
      driverList.append(row);

      if (String(driver._id) === previousId || (!previousId && drivers.length === 1)) selectDriver();
    });
  }

  function selectedFare() {
    return state.preview?.[`${state.rideType}Fares`];
  }

  function renderFare() {
    const fare = selectedFare();
    document.querySelector('[data-fare-base]').textContent = fare ? money(fare.baseFare) : 'ETB --';
    document.querySelector('[data-fare-distance]').textContent = fare ? money(fare.fareInDistance) : 'ETB --';
    document.querySelector('[data-fare-time]').textContent = fare ? money(fare.fareInTime) : 'ETB --';
    document.querySelector('[data-fare-total]').textContent = fare ? money(fare.total) : 'ETB --';
    document.querySelector('[data-fare-distance-label]').textContent = state.preview
      ? `Distance, ${state.preview.totalDistance} km`
      : 'Distance';
    document.querySelector('[data-fare-time-label]').textContent = state.preview
      ? `Time, ${state.preview.totalDuration}`
      : 'Time';
    document.querySelectorAll('[data-ride-type]').forEach((button) => {
      const optionFare = state.preview?.[`${button.dataset.rideType}Fares`];
      button.querySelector('span').textContent = optionFare ? money(optionFare.total) : 'ETB --';
    });
  }

  async function loadNearbyDrivers() {
    if (!state.pickup) return;
    const sequence = ++state.nearbySequence;
    driverList.textContent = 'Finding nearby drivers...';
    try {
      const { data: result } = await axios.post('/api/v1/trip/nearby', {
        pickupLat: state.pickup.coordinates[0],
        pickupLon: state.pickup.coordinates[1],
      });
      if (sequence !== state.nearbySequence) return;
      state.nearbyDrivers = result.data.nearbyDrivers || [];
      mapController.setDrivers(state.nearbyDrivers);
      renderDrivers(state.nearbyDrivers);
      if (!state.destination) {
        status(
          state.nearbyDrivers.length
            ? `${state.nearbyDrivers.length} drivers nearby. Enter a destination.`
            : 'No drivers nearby yet. Enter a destination anyway.',
        );
      }
    } catch (error) {
      if (sequence !== state.nearbySequence) return;
      driverList.textContent = error.response?.data?.message || 'Could not load nearby drivers.';
    }
  }

  async function updatePreview() {
    if (!state.pickup) {
      state.preview = null;
      renderFare();
      confirmButton.disabled = true;
      status('Choose a pickup location to preview your ride.');
      return;
    }
    if (!state.destination) {
      state.preview = null;
      renderFare();
      confirmButton.disabled = true;
      loadNearbyDrivers();
      status('Enter a destination to see fare and route.');
      return;
    }
    const sequence = ++state.previewSequence;
    confirmButton.disabled = true;
    mapController.setPickup(state.pickup.coordinates);
    mapController.setDestination(state.destination.coordinates);
    mapController.setRoute(
      {
        type: 'LineString',
        coordinates: [
          [state.pickup.coordinates[1], state.pickup.coordinates[0]],
          [state.destination.coordinates[1], state.destination.coordinates[0]],
        ],
      },
      state.nearbyDrivers,
    );
    status('Calculating fare...');
    loadNearbyDrivers();
    try {
      const { data: result } = await axios.post('/api/v1/trip/preview', {
        pickupLat: state.pickup.coordinates[0],
        pickupLon: state.pickup.coordinates[1],
        dropoffLat: state.destination.coordinates[0],
        dropoffLon: state.destination.coordinates[1],
      });
      if (sequence !== state.previewSequence) return;
      state.preview = result.data;
      if (result.data.nearbyDrivers?.length) {
        state.nearbyDrivers = result.data.nearbyDrivers;
        mapController.setDrivers(state.nearbyDrivers);
        renderDrivers(state.nearbyDrivers);
      }
      if (state.preview.geometry) {
        mapController.setRoute(state.preview.geometry, state.nearbyDrivers);
      }
      renderFare();
      status(
        `${state.preview.totalDistance} km · ${state.preview.totalDuration} · ${state.pickup.label} to ${state.destination.label}`,
      );
      confirmButton.disabled = !state.selectedDriverId || !selectedFare();
    } catch (error) {
      if (sequence !== state.previewSequence) return;
      state.preview = null;
      renderFare();
      const message = error.response?.data?.message || error.message || 'Unable to preview this ride.';
      status(message, true);
    }
  }

  attachAutocomplete(pickupInput, document.getElementById('pickup-suggestions'), 'pickup');
  attachAutocomplete(destinationInput, document.getElementById('destination-suggestions'), 'destination');
  if (document.querySelectorAll('[data-ride-type]'))
    document.querySelectorAll('[data-ride-type]').forEach((button) => {
      button.addEventListener('click', () => {
        document.querySelectorAll('[data-ride-type]').forEach((option) => option.classList.remove('active'));
        button.classList.add('active');
        state.rideType = button.dataset.rideType;
        renderFare();
      });
    });
  if (document.querySelector('[data-swap-locations]'))
    document.querySelector('[data-swap-locations]').addEventListener('click', () => {
      [state.pickup, state.destination] = [state.destination, state.pickup];
      [pickupInput.value, destinationInput.value] = [destinationInput.value, pickupInput.value];
      if (state.pickup) mapController.setPickup(state.pickup.coordinates);
      if (state.destination) mapController.setDestination(state.destination.coordinates);
      updatePreview();
    });
  if (confirmButton)
    confirmButton.addEventListener('click', async () => {
      const fare = selectedFare();
      if (!fare || !state.selectedDriverId || confirmButton.disabled) return;
      confirmButton.disabled = true;
      confirmButton.textContent = 'Requesting ride...';
      try {
        const { data: result } = await axios.post('/api/v1/trip', {
          driverId: state.selectedDriverId,
          pickupLat: state.pickup.coordinates[0],
          pickupLon: state.pickup.coordinates[1],
          dropoffLat: state.destination.coordinates[0],
          dropoffLon: state.destination.coordinates[1],
          pickupAddress: state.pickup.label,
          dropoffAddress: state.destination.label,
          payment_method: 'cash',
          fare_breakdown: {
            base_fare: fare.baseFare,
            meter_fare: fare.fareInDistance + fare.fareInTime,
            total_fare: fare.total,
          },
        });
        window.location.href = `/tracking/${encodeURIComponent(result.data.trip._id)}`;
      } catch (error) {
        const message = error.response?.data?.message || error.message || 'Unable to request this ride.';
        if (error.response?.status === 409) await updatePreview();
        status(message, true);
        confirmButton.disabled = !state.selectedDriverId || !selectedFare();
        confirmButton.textContent = 'Confirm booking';
      }
    });

  const addisCenter = [9.0371, 38.7533];

  function usePickup(coordinates, label, reverse = true) {
    state.pickup = { coordinates, label };
    pickupInput.value = label;
    mapController.setPickup(coordinates);
    updatePreview();
    if (!reverse) return;
    reverseGeocode(coordinates).then((address) => {
      if (!address || state.pickup?.coordinates !== coordinates) return;
      state.pickup.label = address;
      pickupInput.value = address;
    });
  }

  usePickup(addisCenter, 'Bole, Addis Ababa', false);
  pickupInput.placeholder = 'Enter pickup location';

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => usePickup([coords.latitude, coords.longitude], 'Current location'),
      () => {},
      { enableHighAccuracy: false, maximumAge: 300000, timeout: 2500 },
    );
  }
}
