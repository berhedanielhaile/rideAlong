/*eslint-disable*/

import L from 'leaflet';
import { maplibreGL } from '@maplibre/maplibre-gl-leaflet';
import 'leaflet/dist/leaflet.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerIconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';

export function initMap() {
  const mapEl = document.getElementById('map');
  if (!mapEl) return null;

  const fallbackCenter = [9.03, 38.74];
  const map = L.map(mapEl, {
    scrollWheelZoom: false,
    touchZoom: true,
    doubleClickZoom: true,
    zoomControl: false,
    keyboard: false,
    boxZoom: false,
  }).setView(fallbackCenter, 13);
  const rasterStyle = {
    version: 8,
    sources: {
      openstreetmap: {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      },
    },
    layers: [{ id: 'openstreetmap-raster', type: 'raster', source: 'openstreetmap' }],
  };
  const styleLayer = maplibreGL({ style: rasterStyle }).addTo(map);
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
  let routeLayer;
  const driversLayer = L.layerGroup().addTo(map);

  function setPickup(coordinates) {
    if (!pickupMarker) pickupMarker = L.marker(coordinates, { icon }).addTo(map);
    else pickupMarker.setLatLng(coordinates);
  }

  function setDestination(coordinates) {
    if (!destinationMarker) destinationMarker = L.marker(coordinates, { icon }).addTo(map);
    else destinationMarker.setLatLng(coordinates);
  }

  function setRoute(geometry, nearbyDrivers = []) {
    if (routeLayer) map.removeLayer(routeLayer);
    routeLayer = L.geoJSON(geometry, { style: { color: '#176b5b', weight: 5, opacity: 0.82 } }).addTo(map);
    const bounds = routeLayer.getBounds();
    if (pickupMarker) bounds.extend(pickupMarker.getLatLng());
    if (destinationMarker) bounds.extend(destinationMarker.getLatLng());
    nearbyDrivers.forEach((driver) => {
      if (driver.location?.length === 2) bounds.extend([driver.location[1], driver.location[0]]);
    });
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [44, 44], maxZoom: 15 });
  }

  function setDrivers(drivers = []) {
    driversLayer.clearLayers();
    drivers.forEach((driver) => {
      if (!driver.location || driver.location.length !== 2) return;
      L.circleMarker([driver.location[1], driver.location[0]], {
        radius: 7,
        color: '#fff',
        weight: 2,
        fillColor: '#e0643b',
        fillOpacity: 1,
      })
        .bindTooltip(`${driver.name} · ${Math.max(1, Math.round(driver.distanceMeters / 250))} min away`)
        .addTo(driversLayer);
    });
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
    driversLayer.clearLayers();
  }

  return {
    setPickup,
    setDestination,
    setRoute,
    setDrivers,
    clearLocation,
    invalidateSize: () => map.invalidateSize(),
    map,
  };
}
