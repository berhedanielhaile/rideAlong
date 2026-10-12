/*eslint-disable*/

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerIconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';

const carIcon = (live = false) =>
  L.divIcon({
    className: live ? 'map-car map-car--live' : 'map-car',
    html: '<span class="map-car__dot" aria-hidden="true"></span>',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });

export function initMap() {
  const mapEl = document.getElementById('map');
  if (!mapEl) return null;

  const fallbackCenter = [9.03, 38.74];
  const map = L.map(mapEl, {
    scrollWheelZoom: true,
    touchZoom: true,
    doubleClickZoom: true,
    zoomControl: false,
    keyboard: false,
    dragging: true,
  }).setView(fallbackCenter, 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
    subdomains: 'abc',
    maxZoom: 19,
  }).addTo(map);

  const icon = L.icon({
    iconUrl: markerIconUrl,
    iconRetinaUrl: markerIconRetinaUrl,
    shadowUrl: markerShadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
  let pickupMarker = L.marker(fallbackCenter, { icon }).addTo(map);
  let destinationMarker;
  let vehicleMarker;
  let routeLayer;
  const driversLayer = L.layerGroup().addTo(map);

  function setPickup(coordinates, { focus = false, zoom = 12 } = {}) {
    if (!pickupMarker) pickupMarker = L.marker(coordinates, { icon }).addTo(map);
    else pickupMarker.setLatLng(coordinates);
    if (focus) map.setView(coordinates, zoom);
  }

  function setDestination(coordinates) {
    if (!destinationMarker) destinationMarker = L.marker(coordinates, { icon }).addTo(map);
    else destinationMarker.setLatLng(coordinates);
  }

  function setRoute(geometry, nearbyDrivers = [], options = {}) {
    if (routeLayer) map.removeLayer(routeLayer);
    routeLayer = L.geoJSON(geometry, { style: { color: '#0d9488', weight: 5, opacity: 0.85 } }).addTo(map);
    if (options.fit === false) return;
    const bounds = routeLayer.getBounds();
    if (pickupMarker) bounds.extend(pickupMarker.getLatLng());
    if (destinationMarker) bounds.extend(destinationMarker.getLatLng());
    if (options.includeDrivers) {
      nearbyDrivers.forEach((driver) => {
        if (driver.location?.length === 2) bounds.extend([driver.location[1], driver.location[0]]);
      });
    }
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
  }

  function setDrivers(drivers = [], selectedId = null) {
    driversLayer.clearLayers();
    drivers.forEach((driver) => {
      if (!driver.location || driver.location.length !== 2) return;
      const selected = selectedId && String(driver._id) === String(selectedId);
      L.marker([driver.location[1], driver.location[0]], { icon: carIcon(selected), zIndexOffset: selected ? 400 : 200 })
        .bindTooltip(
          `${driver.name}${
            Number.isFinite(driver.distanceMeters)
              ? ` · ${Math.max(1, Math.round(driver.distanceMeters / 250))} min away`
              : ''
          }`,
        )
        .addTo(driversLayer);
    });
  }

  function setVehicle(coordinates, label = 'Your driver') {
    if (!coordinates || coordinates.length !== 2) return;
    const latlng = [coordinates[0], coordinates[1]];
    if (!vehicleMarker) {
      vehicleMarker = L.marker(latlng, { icon: carIcon(true), zIndexOffset: 600 }).addTo(map);
    } else {
      vehicleMarker.setLatLng(latlng);
    }
    vehicleMarker.bindTooltip(label);
  }

  function clearLocation(which) {
    if (which === 'pickup' && pickupMarker) {
      map.removeLayer(pickupMarker);
      pickupMarker = null;
    }
    if (which === 'destination' && destinationMarker) {
      map.removeLayer(destinationMarker);
      destinationMarker = null;
    }
    if (routeLayer) {
      map.removeLayer(routeLayer);
      routeLayer = null;
    }
  }

  window.requestAnimationFrame(() => map.invalidateSize());
  window.addEventListener('resize', () => map.invalidateSize());

  return {
    setPickup,
    setDestination,
    setRoute,
    setDrivers,
    setVehicle,
    clearLocation,
    invalidateSize: () => map.invalidateSize(),
    map,
  };
}
